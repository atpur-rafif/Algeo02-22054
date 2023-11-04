#include <stdio.h>
#include "lib/image.h"
#include "lib/vector.h"

int main(){
    Image img;
    getImage(&img, "./img/Lena.bmp");

    RGB r = getRGB(img, 0, 0);
    printf("%d %d %d", r.red, r.green, r.blue);
}