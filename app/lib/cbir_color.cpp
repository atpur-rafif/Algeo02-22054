#include "cbir_color.hpp"
#include "image.hpp"
#include "vector.hpp"

int getBinH(double h){
    int r = 1;

    if(h > 25.0) r = 2;
    if(h > 40.0) r = 3;
    if(h > 120.0) r = 4;
    if(h > 190.0) r = 5;
    if(h > 270.0) r = 6;
    if(h > 295) r = 7;
    if(h > 315) r = 0;

    return r;
}

int getBinS(double s){
    int r = 0;

    if(s > 0.2) r = 1;
    if(s > 0.7) r = 2;

    return r;
}

int getBinV(double v){
    int r = 0;

    if(v > 0.2) r = 1;
    if(v > 0.7) r = 2;

    return r;
}

Vector *getHSVFeatureVector(Image *img){
    Vector* v = new Vector(14);

    for(int i = 0; i < img->height; ++i){
        for(int j = 0; j < img->width; ++j){
            HSV hsv = img->getHSV(j, i);
            
            v->component[getBinH(hsv.h)] += 1;
            v->component[getBinS(hsv.s) + 8] += 1;
            v->component[getBinV(hsv.v) + 11] += 1;
        }
    }

    return v;
}

double getColorAngle(Image *img1, Image *img2){
    Vector* a = getHSVFeatureVector(img1);
    Vector* b = getHSVFeatureVector(img2);
    double result = Vector::angle(a, b);
    a->display();
    printf("\n");
    b->display();
    printf("\n");
    delete a; delete b;
    return result;
}