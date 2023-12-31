#include "vector.hpp"
#include "utils.hpp"
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

Vector::Vector(int dimension){
    this->dimension = dimension;
    this->component = (double*) malloc(dimension * sizeof(double));
    for(int i = 0; i < dimension; ++i){
        this->component[i] = 0.0;
    }
}

Vector::Vector(int dimension, double* components): Vector(dimension){
    for(int i = 0; i < dimension; ++i){
        this->component[i] = components[i];
    }
}

Vector::~Vector(){
    free(this->component);
}

void Vector::display(){
    printf("[");
    for(int i = 0; i < this->dimension; ++i){
        printf("%lf", this->component[i]);
        if(i != this->dimension - 1) printf(",");
    }
    printf("]");
    fflush(stdout);
}

double Vector::innerProduct(Vector *vectorA, Vector *vectorB){
    if(vectorA->dimension != vectorB->dimension) return NAN;

    double result = 0.0;
    for(int i = 0; i < vectorA->dimension; ++i){
        result += vectorA->component[i] * vectorB->component[i];
    }

    return result;
}

double Vector::norm(Vector *vector){
    double result = 0.0;
    for(int i = 0; i < vector->dimension; ++i){
        result += vector->component[i] * vector->component[i];
    }

    return sqrt(result);
}

double Vector::angle(Vector *vectorA, Vector *vectorB){
    if(vectorA->dimension != vectorB->dimension) return NAN;
    double c = Vector::innerProduct(vectorA, vectorB) / (Vector::norm(vectorA) * Vector::norm(vectorB));
    clampNumber(c, 0.0, 1.0);
    return c;
}

Vectors::Vectors(int size){
    this->size = size;
    this->vectors = (Vector**) calloc(size, sizeof(Vector*));
}

Vectors::~Vectors(){
    for(int i = 0; i < this->size; ++i){
        Vector* v = this->vectors[i];
        if(!v) delete v;
    }
    free(this->vectors);
}

double Vectors::getAngleAverage(Vectors *vs1, Vectors *vs2){
    double res = 0;
    int size = fmin(vs1->size, vs2->size);
    for (int i = 0; i < size; ++i){
        res += Vector::angle(vs1->vectors[i], vs2->vectors[i]);
    }
    res = res / size;

    return res;
}