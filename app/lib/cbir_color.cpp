#include "cbir_color.hpp"
#include "image.hpp"
#include "vector.hpp"

Vector *getHSVFeatureVector(Image *img, int binSize){
    Vector* v = new Vector(binSize * 3);

    for(int i = 0; i < img->height; ++i){
        for(int j = 0; j < img->width; ++j){
            HSV hsv = img->getHSV(j, i);
            
            int ih = (int) ((hsv.h / 360.0) * binSize); // Normalize h from [0..360] to [0..1]
            int is = (int) (hsv.s * binSize);
            int iv = (int) (hsv.v * binSize);

            if(ih >= binSize) ih = binSize - 1;
            if(is >= binSize) is = binSize - 1;
            if(iv >= binSize) iv = binSize - 1;

            v->component[ih] += 1;
            v->component[is + binSize] += 1;
            v->component[iv + (binSize * 2)] += 1;
        }
    }

    return v;
}

double getColorAngle(Image *img1, Image *img2, int binSize){
    Vector* a = getHSVFeatureVector(img1, binSize);
    Vector* b = getHSVFeatureVector(img2, binSize);
    double result = Vector::angle(a, b);
    delete a; delete b;
    return result;
}