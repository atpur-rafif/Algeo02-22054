#include "cbir_color.hpp"
#include "image.hpp"
#include "vector.hpp"

Vector *getHSVFeatureVector(Image *img, Histogram *hHist, Histogram *sHist, Histogram *vHist){
    Vector* v = new Vector(hHist->size + sHist->size + vHist->size);

    for(int i = 0; i < img->height; ++i){
        for(int j = 0; j < img->width; ++j){
            HSV hsv = img->getHSV(j, i);
            
            int ih = hHist->getBin(hsv.h);
            int is = sHist->getBin(hsv.s);
            int iv = vHist->getBin(hsv.v);

            v->component[ih] += 1;
            v->component[hHist->size + is] += 1;
            v->component[hHist->size + sHist->size + iv] += 1;
        }
    }

    return v;
}

double getColorAngle(Image *img1, Image *img2, int binSize){
    auto hist = Histogram::createUniformHistogram(0.0, 1.0, binSize);
    double result = getColorAngle(img1, img2, hist, hist, hist);
    delete hist;
    return result;
}

double getColorAngle(Image *img1, Image *img2, Histogram *hHist, Histogram *sHist, Histogram *vHist){
    Vector* a = getHSVFeatureVector(img1, hHist, sHist, vHist);
    Vector* b = getHSVFeatureVector(img2, hHist, sHist, vHist);
    double result = Vector::angle(a, b);
    delete a; delete b;
    return result;
}