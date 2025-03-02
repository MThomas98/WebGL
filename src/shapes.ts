export const CUBE =
{
    // Multiplying by 4 as it's sizeof(float) (each value is a float)
    stride: 8 * 4,
    vertexOffset: 0,
    texCoordsOffset: 3 * 4,
    normalsOffset: 5 * 4,
    verticies: [
        // [VERTEX POSITON] | [TEXTURE_COORDS] | [NORMALS]
        // Back
        -0.5, -0.5,  0.5,  0.0, 0.0,  0.0,  0.0,  1.0, 
         0.5, -0.5,  0.5,  1.0, 0.0,  0.0,  0.0,  1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,  0.0,  0.0,  1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,  0.0,  0.0,  1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,  0.0,  0.0,  1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,  0.0,  0.0,  1.0,

        // Front
        -0.5, -0.5, -0.5,  0.0, 0.0,  0.0,  0.0, -1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,  0.0,  0.0, -1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,  0.0,  0.0, -1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,  0.0,  0.0, -1.0,
         0.5, -0.5, -0.5,  1.0, 0.0,  0.0,  0.0, -1.0,
        -0.5, -0.5, -0.5,  0.0, 0.0,  0.0,  0.0, -1.0,

        // Left
        -0.5,  0.5,  0.5,  1.0, 0.0, -1.0,  0.0,  0.0,
        -0.5,  0.5, -0.5,  1.0, 1.0, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, -1.0,  0.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0, -1.0,  0.0,  0.0,
        -0.5,  0.5,  0.5,  1.0, 0.0, -1.0,  0.0,  0.0,

        // Right
         0.5,  0.5,  0.5,  0.0, 1.0,  1.0,  0.0,  0.0,
         0.5, -0.5,  0.5,  1.0, 1.0,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,  1.0,  0.0,  0.0,
         0.5,  0.5, -0.5,  0.0, 0.0,  1.0,  0.0,  0.0,
         0.5,  0.5,  0.5,  0.0, 1.0,  1.0,  0.0,  0.0,

        // Bottom
        -0.5, -0.5, -0.5,  0.0, 1.0,  0.0, -1.0,  0.0,
         0.5, -0.5, -0.5,  1.0, 1.0,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,  0.0, -1.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,  0.0, -1.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,  0.0, -1.0,  0.0,
        
        // Top
        -0.5,  0.5, -0.5,  0.0, 0.0,  0.0,  1.0,  0.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,  0.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  1.0, 0.0,  0.0,  1.0,  0.0,
        -0.5,  0.5, -0.5,  0.0, 0.0,  0.0,  1.0,  0.0,
    ],
};