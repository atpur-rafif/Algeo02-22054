#include "image.hpp"

#define MAX_PATH 200

#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.hpp"

Image::Image(string path){
    this->pixel = stbi_load(path.c_str(), &(this->width), &(this->height), &(this->channel), 3);
}

Image::~Image(){
    printf("Image Destructed\n");
    fflush(stdout);
    stbi_image_free(this->pixel);
}

RGB Image::getRGB(int x, int y){
    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > this->width) x = this->width - 1;
    if(y > this->height) y = this->height - 1;

    int pos = y * this->height + x;
    return (RGB){this->pixel[pos], this->pixel[pos + 1], this->pixel[pos + 2]};
}

HSV Image::getHSV(int x, int y){
    return Image::RGBtoHSV(Image::getRGB(x, y));
}

HSV Image::RGBtoHSV(RGB value){
    double r = ((double) value.red) / 255.0f;
    double g = ((double) value.green) / 255.0f;
    double b = ((double) value.blue) / 255.0f;

    double cmax = fmax(fmax(r, g), b);
    double cmin = fmin(fmin(r, g), b);
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

    return (HSV){h, s, v};
}