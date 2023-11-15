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

Vectors *getHSVFeatureVector(Image *img, int blockSize){
    ImageBlocks *blocks = new ImageBlocks(img, blockSize, blockSize);
    Vectors* vs = new Vectors(blockSize * blockSize);

    for(int i = 0; i < blocks->blockRow; ++i){
        for(int j = 0; j < blocks->blockCol; ++j){
            Vector* v = new Vector(72);
            Block *block = blocks->getBlock(i, j);

            for (int k = 0; k < block->height; ++k){
                for (int l = 0; l < block->width; ++l){
                    HSV hsv = block->getHSV(l, k);

                    int ih = getBinH(hsv.h);
                    int is = getBinS(hsv.s);
                    int iv = getBinV(hsv.v);

                    v->component[(24 * iv) + (8 * is) + ih] += 1;
                }
            }

            vs->vectors[i * blocks->blockRow + j] = v;
        }
    }

    delete blocks;
    return vs;
}

double getColorAngle(Vectors *vs1, Vectors *vs2){
    double res = 0;
    int size = vs1->size;
    for(int i = 0; i < size; ++i){
        res += Vector::angle(vs1->vectors[i], vs2->vectors[i]);
    }
    res = res / size;

    return res;
}