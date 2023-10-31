CC = g++

MAIN = $(SRC)/main

SRC = app
OUT = dist/bin
OBJ = $(OUT)/o


$(OBJ)/%.o: $(SRC)/%.cpp
	mkdir -p $(@D)
	$(CC) -c -o $@ $^

build: $(OBJ)/main.o
	mkdir -p $(@D)
	$(CC) -o $(OUT)/main $^