# isotoon

This is a library for creating isometric cartoon-like view mesh rendering of any map. It is built on top of [PixiJS](https://pixijs.com/) and uses OpenStreetMap data to create the mesh.


This is a proof of concept and was made to show as a demo in the upcoming JSCraftCamp 2026.

The concept is inspired by this project: https://cannoneyed.com/isometric-nyc/ . You can read about it here: https://cannoneyed.com/projects/isometric-nyc


Instead of using AI models (Nano banana) to generate the final images, this library uses a more traditional approach of creating the mesh and rendering it with PixiJS. Also, we use OpenStreetMap data instead of 3D CityGML data.


For now, we will focus on Maxvorstadt area of Munich.