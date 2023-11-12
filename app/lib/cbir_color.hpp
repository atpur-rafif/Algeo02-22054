#ifndef _CBIR_COLOR_
#define _CBIR_COLOR_

#include "vector.hpp"
#include "image.hpp"
#include "histogram.hpp"

Vector *getHSVFeatureVector(Image *img, Histogram *hHist, Histogram *sHist, Histogram *vHist);
double getColorAngle(Image *img1, Image *img2, int binSize);
double getColorAngle(Image *img1, Image *img2, Histogram *hHist, Histogram *sHist, Histogram *vHist);

#endif

