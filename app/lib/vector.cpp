#include "vector.hpp"
#include <stdlib.h>
#include <math.h>

VectorPointer createVector(VectorPointer vector, int dimension){
    vector->component = (double*) (dimension * sizeof(double));
    if(vector->component == NULL) return NULL;

    vector->dimension = dimension;
    return vector;
}

double getInnerProduct(Vector vectorA, Vector vectorB){
    if(vectorA.dimension != vectorB.dimension) return NAN;

    double result = 0.0;
    for(int i = 0; i < vectorA.dimension; ++i){
        result += vectorA.component[i] * vectorB.component[i];
    }

    return result;
}

double getVectorNorm(Vector vector){
    double result = 0.0;
    for(int i = 0; i < vector.dimension; ++i){
        result += vector.component[i] * vector.component[i];
    }

    return sqrt(result);
}

double getVectorAngle(Vector vectorA, Vector vectorB){
    if(vectorA.dimension != vectorB.dimension) return NAN;
    return getInnerProduct(vectorA, vectorB) / (getVectorNorm(vectorA) * (getVectorNorm(vectorB)));
}

