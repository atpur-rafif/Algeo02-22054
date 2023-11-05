#ifndef _UTILS_
#define _UTILS_

template <typename T>
void clampNumber(T& target, T min, T max){
    if(target < min) target = min;
    if(target > max) target = max;
}

#endif