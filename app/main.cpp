#include <stdio.h>
#include <string>
#include <time.h>

#define STB_IMAGE_IMPLEMENTATION
#include "stb/std_image.h"

using namespace std;

struct RGB{
    unsigned char red;
    unsigned char green;
    unsigned char blue;
};

struct HSV{
    double h;
    double s;
    double v;
};

class Image{
    private:
        int height;
        int width;
        int channel;
        unsigned char* img;
    public:
        Image(char* filePath);
        ~Image();
        RGB getPixel(int x, int y);
        int* getHSVFeature(int binSize);
        static HSV RGBtoHSV(RGB value);
};

Image::Image(char* filePath){
    img = stbi_load(filePath, &width, &height, &channel, 3);
}

Image::~Image(){
    stbi_image_free(img);
}

RGB Image::getPixel(int x, int y){
    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > width) x = width - 1;
    if(y > height) y = height - 1;

    int pos = y * width + x;
    return {img[pos], img[pos + 1], img[pos + 2]};
}

HSV Image::RGBtoHSV(RGB value){
    double r = value.red / 255.0f;
    double g = value.green / 255.0f;
    double b = value.blue / 255.0f;

    double cmax = max(max(r, g), b);
    double cmin = min(min(r, g), b);
    double delta = cmax - cmin;

    double h;
    if(delta == 0) h = 0;
    else if(cmax == r) h = fmod(60 * ((g - b) / delta) + 360, 360);
    else if(cmax == g) h = fmod(60 * ((b - r) / delta) + 120, 360);
    else if(cmax == b) h = fmod(60 * ((r - g) / delta) + 240, 360);

    double s;
    if(cmax == 0) s = 0;
    else if(cmax != 0) s = delta / cmax;

    double v = cmax;

    return { h, s, v };
}

int* Image::getHSVFeature(int binSize){
    int binLength = binSize * 3;
    int *bin = (int*) malloc(sizeof(int) * binLength);

    if(bin == NULL) return bin;

    for(int i = 0; i < binLength; ++i) bin[i] = 0;

    for(int i = 0; i < height; ++i){
        for(int j = 0; j < width; ++j){
            bin[0] += 1;
            RGB rgb = getPixel(j, i);
            HSV hsv = Image::RGBtoHSV(rgb);

            hsv.h = hsv.h / 360.0; /* Normalize h from [0..360] to [0..1]*/

            int ih = (int) (hsv.h * binSize);
            int is = (int) (hsv.s * binSize);
            int iv = (int) (hsv.v * binSize);


            bin[ih] += 1;
            bin[is + binSize] += 1;
            bin[iv + binSize * 2] += 1;
        }
    }

    return bin;
}

int main(){
    int size = 100;

    for(int i = 0; i < 1000; ++i){
        char filePath[1000];
        snprintf(filePath, 1000, "./dataset/%d.jpg", i);

        clock_t begin = clock();

        Image img(filePath);
        int* bin = img.getHSVFeature(size);

        clock_t end = clock();

        double spent = (double)(end - begin) / CLOCKS_PER_SEC;
        printf("%fs\n", spent);
        fflush(stdout);
    }
}