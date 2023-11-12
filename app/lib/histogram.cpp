#include <stdlib.h>
#include <vector>
#include "histogram.hpp"
#include "utils.hpp"

using namespace std;

Histogram::Histogram(int binLength, double *bins){
    this->bins = bins;
    this->size = binLength - 1;
}

Histogram::Histogram(vector<double> vBins){
    int size = vBins.size();
    this->size = size - 1;
    this->bins = new double[size];
    for(int i = 0; i < size; ++i){
        this->bins[i] = vBins[i];
    }
}

Histogram::~Histogram(){
    free(this->bins);
}

int Histogram::getBin(double value){
    int res = 0;
    clampNumber(value, this->bins[0], this->bins[this->size]);

    for(int i = 1; i < this->size; ++i){
        if(value > this->bins[i]) ++res;
        else break;
    }

    return res;
}

Histogram* Histogram::createUniformHistogram(double min, double max, int size){
    double step = (max - min) / size;
    double *bins = (double*) malloc(size * sizeof(double));
    for(int i = 0; i < size; ++i) bins[i] = min + step * i;
    bins[size - 1] = max;
    return new Histogram(size, bins);
}

