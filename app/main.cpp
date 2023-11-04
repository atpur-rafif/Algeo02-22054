#include <stdio.h>
#include <string>
#include <iostream>
#include <format>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/cbir_color.hpp"

using namespace std;

int main(){
    Image* target = new Image("./dataset/0.jpg");

    for(int i = 0; i < 1000; ++i){

        clock_t begin = clock();

        string path = "./dataset/" + to_string(i) + ".jpg";
        Image* test = new Image(path);
        double angle = getColorAngle(target, test, 10);

        clock_t end = clock();

        double spent = (double)(end - begin) / CLOCKS_PER_SEC;

        printf("Spent: %lf | Angle: %lf\n", spent, angle);
        fflush(stdout);
    }
}