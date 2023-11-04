#ifndef _CBIR_COLOR_
#define _CBIR_COLOR_

#include "vector.hpp"
#include "image.hpp"

Vector *getHSVFeatureVector(Image *img, int binSize);
double getColorAngle(Image *img1, Image *img2, int binSize);

#endif

