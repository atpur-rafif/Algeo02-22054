
#ifndef _CBIR_TEXTURE_
#define _CBIR_TEXTURE_

#include "image.hpp"
#include "vector.hpp"

#define QUANTIZATION_LEVEL 256

Vector *getGLCMVectorFeature(Image* img, int offsetX, int offsetY);
Vector *getTextureFeature(Image* img);
double getContrast(Vector *GLCM);
double getHomogeneity(Vector *GLCM);
double getEntropy(Vector *GLCM);

#endif