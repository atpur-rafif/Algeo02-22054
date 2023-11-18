#ifndef _CBIR_COLOR_
#define _CBIR_COLOR_

#include "vector.hpp"
#include "image.hpp"
#define BLOCK 4

Vectors *getHSVFeatureVector(Image *img);
double getColorAngle(Vectors *vs1, Vectors *vs2);

#endif