#ifndef _IMAGE_
#define _IMAGE_

typedef struct {
    unsigned char red;
    unsigned char green;
    unsigned char blue;
} RGB;

typedef struct {
    double h;
    double s;
    double v;
} HSV;

typedef struct{
    unsigned char* pixel;
    int width;
    int height;
    int channel;
} Image;

void getImage(Image* img, char* path);
void clearImage(Image* img);
RGB getRGB(Image img, int x, int y);
HSV RGBtoHSV(RGB value);

#endif