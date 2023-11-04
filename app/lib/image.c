#include "image.h"

#define MAX_PATH 200

#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.h"

void getImage(Image* img, char* path){
    img->pixel = stbi_load(path, &(img->width), &(img->height), &(img->channel), 3);
}

void clearImage(Image* img){
    free(img);
    stbi_image_free(img->pixel);
}

RGB getRGB(Image img, int x, int y){
    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > img.width) x = img.width - 1;
    if(y > img.height) y = img.height - 1;

    int pos = y * img.width + x;
    return (RGB){img.pixel[pos], img.pixel[pos + 1], img.pixel[pos + 2]};
}

HSV RGBtoHSV(RGB value){
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