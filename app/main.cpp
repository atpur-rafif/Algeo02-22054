#include <stdio.h>
#include <string>
#include <iostream>
#include <format>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/cbir_color.hpp"
#include "lib/cbir_texture.hpp"
#include "lib/nlohmann/json.hpp"

using namespace std;
using json = nlohmann::json;

int main(){
    Image* target = new Image("./dataset/0.jpg");

    for(int i = 0; i < 1000; ++i){

        clock_t begin = clock();

        string path = "./dataset/" + to_string(i) + ".jpg";
        Image* test = new Image(path);

        double angle = getColorAngle(test, target, 10);

        clock_t end = clock();

        double spent = (double)(end - begin) / CLOCKS_PER_SEC;

        delete test;

        printf("Spent: %lf | Angle: %lf\n", spent, angle);
        fflush(stdout);
    }
}