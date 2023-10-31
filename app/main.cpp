#include <stdio.h>
#include <string>

#define STB_IMAGE_IMPLEMENTATION
#include "stb/std_image.h"

using namespace std;

struct RGB{
    unsigned char red;
    unsigned char green;
    unsigned char blue;
};

class Image{
    private:
        int height;
        int width;
        int channel;
        unsigned char* img;
    public:
        Image(string);
        ~Image();
        RGB getPixel(int x, int y);
};

Image::Image(string filePath){
    img = stbi_load(filePath.c_str(), &width, &height, &channel, 3);
}

Image::~Image(){
    stbi_image_free(img);
}

RGB Image::getPixel(int x, int y){
    int pos = y * width + x;
    return {img[pos], img[pos + 1], img[pos + 2]};
}

int main(){
    Image img("./img/Lena.bmp");

    RGB p = img.getPixel(0, 0);
    printf("%d %d %d", p.red, p.green, p.blue);
}