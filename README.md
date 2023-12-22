# DroneModels

This repo is used to track the file droneModels.json which is bundled
across the OpenAthena application platforms.  It contains parameters
representing the physical properties of drone camera in order to make arbitrary point selection
more accurate.  Use the command-line utility `jq` to syntax check
the json file before you commit it.

```
% jq . droneModels.json
% echo $?
```

The exit code should be 0 if the file is syntactically correct.

## What do these values mean?

### Physical properties

Here is an example of a JSONObject for a particluar make/model of drone:
```JSON
    {
      "makeModel": "djiFC6310",
      "isThermal": false,
      "ccdWidthMMPerPixel": "12.83332/5472.0",
      "ccdHeightMMPerPixel": "8.55554/3648.0",
      "widthPixels": 5472,
      "heightPixels": 3648,
      "comment": "DJI Phantom 4 Pro, DJI Phantom 4 Advanced",
      "lensType": "perspective",
      "radialR1": 0.00298599,
      "radialR2": -0.00769116,
      "radialR3": 0.0079115,
      "tangentialT1": -0.000129713,
      "tangentialT2": 0.000221193
    }
```

In this object:
* `makeModel` represents the EXIF make and model String merged together, a unique String representing a specific drone model. The EXIF make String is made all lowercase, while the EXIF model String is made all uppercase.
* `focalLength` is an optional parameter which represents the distance between the focal point (the part of the lens that all light passes through) and the CCD/CMOS sensor which digitizes incoming light. This is only provided in rare cases when such data is unavailable in a camera model's image EXIF data.
* `isThermal` represents whether this particular JSONObject represents the thermal or color camera of a given drone. This is used to solve name collisions in the `makeModel` String that occur when both the thermal and color cameras of a drone report the same model name despite having different parameters.
* `ccdWidthMMPerPixel` represents the width of each pixel (in millimeters) of the drone camera's CCD/CMOS sensor which digitizes incoming light
* `ccdHeightMMPerPixel` represents the height of each pixel (in millimeters) of the drone camera's CCD/CMOS sensor which digitizes incoming light
* `widthPixels` represents the number of pixels in the width of a camera's uncropped, full resolution image
* `heightPixels` represents the number of pixels in the height of a camera's uncropped, full resolution image
* `comment` represents a comment from the author of the object which gives insight into the camera's corresponding drone model and properties
* `lensType` is one of two values: `perspective` or `fisheye`, used for applying the correct correction equations for distortion of incoming light by the camera lens. Read below for further details
* `radialR1` represents the first radial distortion coefficient for the camera's lens
* `radialR2` represents the second radial distortion coefficient for the camera's lens
* `radialR3` represents the third radial distortion coefficient for the camera's lens
* `tangentialT1` represents the first tangential distortion coefficient for the camera's lens
* `tangentialT2` represents the second tangential distortion coefficient for the camera's lens

### Distortion parameters

OpenAthena's basic calculation for ray angle from a selected image point is based on the [idealized pinhole camera model](https://towardsdatascience.com/camera-intrinsic-matrix-with-example-in-python-d79bf2478c12?gi=8bd7b436d2d3). This model makes no consideration of the properties of the actual camera lens, which introduces its own image distortion subtly different than may be expected by the pinhole camera model. These distortions may be [especially pronounced with zoom lenses at larger focal lengths](https://en.wikipedia.org/wiki/Distortion_(optics))

If calibration data (based on real-world calibration with a particular camera model) is present, OpenAthena may use certain parameters to apply a mathematical correction for the distortion a particular camera lens causes. This allows the calculated ray angle for an arbitrary image point to be more accurate.

These two links describe the applicable mathematical formulas:

https://support.pix4d.com/hc/en-us/articles/202559089-How-are-the-Internal-and-External-Camera-Parameters-defined

https://www.mathworks.com/help/vision/ug/camera-calibration.html#:~:text=The%20intrinsic%20parameters%20represent%20the,plane%20using%20the%20intrinsics%20parameters.

The type correction applied depends on whether the `lensType` is either `perspective` or `fisheye`.

`perspective` cameras have the parameters `radialR1`, `radialR2`, `radialR3`, `tangentialT1`, and `tangentialT2`, and such an JSONObject may look like this:
```JSON
    {
      "makeModel": "djiL2D-20C",
      "isThermal": false,
      "ccdWidthMMPerPixel": "17.902472/5280.0",
      "ccdHeightMMPerPixel": "13.357522/3956.0",
      "widthPixels": 5280,
      "heightPixels": 3956,
      "comment": "DJI Mavic 3 Main Hasselblad Camera",
      "lensType": "perspective",
      "radialR1": 0.0044647,
      "radialR2": -0.00549164,
      "radialR3": 0.0246166,
      "tangentialT1": -0.000468935,
      "tangentialT2": -0.000564484
    }

```

`fisheye` cameras have the parameters `c`, `d`, `e`, `f`, and `poly0` to `poly4`. Such an JSONObject may look like this:
```JSON
    {
      "makeModel": "parrotBEBOP 2",
      "isThermal": false,
      "ccdWidthMMPerPixel": "5.7344/4096.0",
      "ccdHeightMMPerPixel": "4.648/3320.0",
      "widthPixels": 4096,
      "heightPixels": 3320,
      "comment": "1/2.3in 14 MP unnamed sensor",
      "lensType": "fisheye",
      "poly0": 0.0,
      "poly1": 1.0,
      "poly2": -0.0561106,
      "poly3": 0.0350564,
      "poly4": -0.0953153,
      "c": 2203.93,
      "d": 0.0,
      "e": 0.0,
      "f": 2203.93
    }
```

## Contributing new drone models

Updates to this file will occur periodically as we test and validate
drone models and through user submissions.

### **lastUpdate** field

The field `lastUpdate` at the top of droneModels.json should be updated with the date + time of your last modification to the file. The format is the same as that output by the command `date` on any Linux/Unix terminal:

```JSON
{
  "lastUpdate": "Fri Dec 22 14:53:15 EST 2023",
  "droneCCDParams": [
    {
      "makeModel": "djiFC220",
      ...
```

### set up pre-commit hook

This repository has a pre-commit hook available to automatically update the `lastUpdate` field upon your creation of a commit.

After cloning this repository, set up the pre-commit hook by copying it into the folder `.git/hooks/`:

```bash
cp pre-commit .git/hooks/
```

### Calibrate parameters for a new drone model

#### Using Theta's [camera-calibration.py](https://github.com/Theta-Limited/camera-calibration)

**For `perspective` lens types only, not `fisheye`**

Theta Informatics maintains the camera-calibration.py python script which allows camera calibration to be performed automatically given a few dozen pictures of a specific pattern (White and Black checkerboard) printout:

[https://github.com/Theta-Limited/camera-calibration](https://github.com/Theta-Limited/camera-calibration)

Please see instructions in the README.md for that project for information on how to use these values to create a new entry in this droneModels.json


#### (alternative) Using PIX4D

Follow these instructions using the unaffiliated PIX4D software to calculate calibrations for your particular drone:

https://support.pix4d.com/hc/en-us/articles/206065716-How-to-calibrate-a-Perspective-Lens-Camera

After calibration, all the necessary data will be available in the PIX4D `icmdb.xml` file, the location on your filesystem described here:

https://support.pix4d.com/hc/en-us/articles/202559349-Which-Cameras-exist-in-PIX4Dmapper-Database-and-which-Parameters-are-used

Finally, convert the data from the PIX4D format to the OpenAthena JSONObject convention shown previously. Rename `radialK1` to `radialR1`, `radialK2` to `radialR2`, and `radialK3` to `radialR3`.

### Contribute your parameters to this project

We welcome third party contributions, especially from drone manufactuers who would like to enhance the compatibility and accuracy of their products with OpenAthena.

Contributions to this project must use the [fork and pull method](https://reflectoring.io/github-fork-and-pull/).

To contribute, make a fork of this repo and clone your fork. Insert your new JSONObject to the `droneCCDParams` array in `droneModels.json`. Install [`jq`](https://jqlang.github.io/jq/) if it is not already on your system, and run the command described previously to check for syntax errors.

When ready to submit, add and commit your changes, and push it to your fork. Finally, use the GitHub web interface to create a pull request to request your fork's changes to be merged into this repository. In your pull request message, please describe your drone model and the process you used to perform calibration.

## Additional Information

[Theta](https://theta.limited/) provides a free and open source UAS
geodesy platform which enables a competitive advantage for its users.

OpenAthena™ allows common drones to spot precise geodetic locations.

An Android port of the [OpenAthena project](https://github.com/Theta-Limited/OpenAthenaAndroid)

An iOS port of the [OpenAthena project](https://github.com/Theta-Limited/OpenAthenaIOS)
