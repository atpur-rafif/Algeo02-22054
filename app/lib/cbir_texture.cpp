#include <limits.h>
#include <cmath>
#include <vector>
#include "cbir_texture.hpp"
#include "cache.hpp"

using namespace std;

static Vectors *mean = new Vectors(3);
static Vectors *dev = new Vectors(3);

// Mapping between Matrix component to Vector Component
int flatten(int x, int y, int yScale){
    return x + y * yScale;
}

Vector *getGLCMVectorFeature(Image* img, int offsetX, int offsetY){
    Vector *v = new Vector(QUANTIZATION_LEVEL * QUANTIZATION_LEVEL);

    for(int i = 0; i < img->height - offsetY; ++i){
        for(int j = 0; j < img->width - offsetX; ++j){
            int g1 = img->getGrayscale(j, i);
            int g2 = img->getGrayscale(j + offsetY, i + offsetX);

            v->component[flatten(g1, g2, QUANTIZATION_LEVEL)] += 1;
        }
    }

    // Matrix Transpose
    Vector* t = new Vector(v->dimension);
    for(int i = 0; i < QUANTIZATION_LEVEL; ++i){
        for(int j = 0; j < QUANTIZATION_LEVEL; ++j){
            double tmp = v->component[flatten(j, i, QUANTIZATION_LEVEL)];
            t->component[flatten(i, j, QUANTIZATION_LEVEL)] = tmp;
        }
    }

    double sum = 0.0;
    for(int i = 0; i < v->dimension; ++i){
        v->component[i] += t->component[i];
        sum += v->component[i];
    };
    delete t;

    if(sum != 0.0){
        for(int i = 0; i < v->dimension; ++i){
            v->component[i] /= sum;
        }
    }

    return v;
}

Vectors *getTextureFeature(Image* img){
    Vectors *vs = new Vectors(3);

    int dimension = TEXTURE_RANGE * TEXTURE_RANGE - 1;
    Vector* contrast = (vs->vectors[0] = new Vector(dimension));
    Vector* homogenity = (vs->vectors[1] = new Vector(dimension));
    Vector* entropy = (vs->vectors[2] = new Vector(dimension));


    for(int i = 0; i < TEXTURE_RANGE; ++i){
        for(int j = 0; j < TEXTURE_RANGE; ++j){
            if(i == 0 && j == 0) continue;

            Vector *v = getGLCMVectorFeature(img, i, j);

            int idx = i * TEXTURE_RANGE + j - 1;
            contrast->component[idx] = getContrast(v);
            homogenity->component[idx] = getHomogeneity(v);
            entropy->component[idx] = getEntropy(v);

            delete v;
        }
    }

    return vs;
}

double getContrast(Vector *GLCM){
    double res = 0.0;
    for(int i = 0; i < QUANTIZATION_LEVEL; ++i){
        for(int j = 0; j < QUANTIZATION_LEVEL; ++j){
            double diff = i - j;
            res += GLCM->component[flatten(i, j, QUANTIZATION_LEVEL)] * (diff * diff);
        }
    }
    return res;
}

double getHomogeneity(Vector *GLCM){
    double res = 0.0;
    for(int i = 0; i < QUANTIZATION_LEVEL; ++i){
        for(int j = 0; j < QUANTIZATION_LEVEL; ++j){
            double diff = i - j;
            res += GLCM->component[flatten(i, j, QUANTIZATION_LEVEL)] / (1 + (diff * diff));
        }
    }
    return res;
}

double getEntropy(Vector *GLCM){
    double res = 0.0;
    for(int i = 0; i < QUANTIZATION_LEVEL; ++i){
        for(int j = 0; j < QUANTIZATION_LEVEL; ++j){
            double val = GLCM->component[flatten(i, j, QUANTIZATION_LEVEL)];
            if(val != 0) res += val * log(val);
        }
    }
    return (-1) * res;
}

void normalizeWithGaussian(Vectors *vs){
    int dimension = TEXTURE_RANGE * TEXTURE_RANGE - 1;
    for (int i = 0; i < 3; ++i){
        for (int j = 0; j < dimension; ++j){
            double v = vs->vectors[i]->component[j];
            v = v - mean->vectors[i]->component[j];
            v = v / dev->vectors[i]->component[j];
            vs->vectors[i]->component[j] = v;
        }
    }
}

void calculateGaussianProperties(string datasetPath, vector<string> dataset){
    mean = new Vectors(3);
    dev = new Vectors(3);

    int dimension = TEXTURE_RANGE * TEXTURE_RANGE - 1;
    for (int i = 0; i < 3; ++i){
        mean->vectors[i] = new Vector(dimension);
        dev->vectors[i] = new Vector(dimension);
    }

    int count = 0; int tillCount = dataset.size();
    for (const auto filename : dataset){
        string path = datasetPath + "/" + filename;
        Vectors *testVectors = getCache(filename);
        bool cacheMiss = testVectors == NULL;

        if (cacheMiss){
            Image *testImage = new Image(path);
            testVectors = getTextureFeature(testImage);
            addCache(filename, testVectors);
            delete testImage;
        }

        for (int i = 0; i < 3; ++i){
            for (int j = 0; j < dimension; ++j){
                double r = testVectors->vectors[i]->component[j];
                mean->vectors[i]->component[j] += r;
                dev->vectors[i]->component[j] += r * r;
            }
        }
        ++count;

        printf("(%d/%d) [Texture Cache Miss] %s\n", count, tillCount, filename.c_str());
        fflush(stdout);
        delete testVectors;
    }

    for (int i = 0; i < 3; ++i){
        for (int j = 0; j < dimension; ++j){
            double m = mean->vectors[i]->component[j];
            double d = dev->vectors[i]->component[j];

            m = m / count;
            d = d / count;
            d = d - (m * m);
            d = sqrt(d);

            mean->vectors[i]->component[j] = m;
            dev->vectors[i]->component[j] = d;
        }
    }
}