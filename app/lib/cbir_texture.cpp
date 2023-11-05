#include "cbir_texture.hpp"

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

Vector *getTextureFeature(Image* img){
    Vector *GLCM = getGLCMVectorFeature(img, 1, 1);
    Vector *res = new Vector(3);

    res->component[0] = getContrast(GLCM);
    res->component[1] = getHomogeneity(GLCM);
    res->component[2] = getEntropy(GLCM);

    delete GLCM;
    return res;
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
            res += val * log(val);
        }
    }
    return -res;
}