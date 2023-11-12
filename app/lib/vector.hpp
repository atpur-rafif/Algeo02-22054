#ifndef _VECTOR_
#define _VECTOR_

class Vector{
    public:
        int dimension;
        double* component;
        void display();
        static double norm(Vector* vector);
        static double innerProduct(Vector* a, Vector* b);
        static double angle(Vector* a, Vector* b);
        Vector(int dimension);
        Vector(int dimension, double* components);
        ~Vector();
};

#endif