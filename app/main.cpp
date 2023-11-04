#include <stdio.h>
#include "lib/image.hpp"
#include "lib/vector.hpp"

int main(){
    Image img;
    getImage(&img, "./img/Lena.bmp");

    RGB r = getRGB(img, 0, 0);
    printf("%d %d %d", r.red, r.green, r.blue);
}