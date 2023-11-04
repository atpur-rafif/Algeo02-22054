#ifndef _VECTOR_
#define _VECTOR_

typedef struct vector{
    double* component;
    int dimension;
} Vector;

typedef struct vector* VectorPointer;

VectorPointer createVector(VectorPointer vector, int dimension);
double getInnerProduct(Vector vectorA, Vector vectorB);
double getVectorNorm(Vector vector);
double getVectorAngle(Vector vectorA, Vector vectorB);

#endif