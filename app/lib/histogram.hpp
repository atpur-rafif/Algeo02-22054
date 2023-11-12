#ifndef _HISTOGRAM_
#define _HISTOGRAM_

#include <vector>

using namespace std;

class Histogram{
public:
    int size;
    Histogram(vector<double> vBins);
    Histogram(int binCount, double *bins);
    ~Histogram();
    int getBin(double value);
    static Histogram* createUniformHistogram(double min, double max, int size);
private:
    double *bins;
};

#endif