// updateDroneModels.js
// update the json file with new parameters per drone
// Bobby Krupczak
// rdk@krupczak.org
// Sun Jun 25 04:52:08 PM EDT 2023
// with help from ChatGPT

// read in current drone models file, update it, and write it back out

const fs = require('fs');

// Function to read the JSON file
function readJSONFile(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading JSON file: ${err}`);
      return callback(err);
    }

    try {
      const json = JSON.parse(data);
      callback(null, json);
    } catch (parseError) {
      console.error(`Error parsing JSON file: ${parseError}`);
      return callback(parseError);
    }
  });
}

function writeJSONToFile(filename, jsonData, callback) {
    const jsonString = JSON.stringify(jsonData,null,2)

  fs.writeFile(filename, jsonString, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing JSON to file: ${err}`);
      return callback(err);
    }

    console.log(`JSON data has been written to ${filename}`);
      callback(null,jsonData);
  });
}

function updateDroneParams(jsonData) {

    // cycle through each drone model and add new params
    // with defaults

    for (i=0; i<jsonData.droneCCDParams.length; i++) {
	console.log("\tUpdating Drone: "+jsonData.droneCCDParams[i].makeModel+", "+jsonData.droneCCDParams[i].comment)
	// add the addtional fields
	// "perspective" or "fisheye"
	jsonData.droneCCDParams[i].lensType = "perspective"
	jsonData.droneCCDParams[i].radialR1 = 0.00
	jsonData.droneCCDParams[i].radialR2 = 0.00
	jsonData.droneCCDParams[i].radialR3 = 0.00
	jsonData.droneCCDParams[i].tangentalT1 = 0.00
	jsonData.droneCCDParams[i].tangentalT2 = 0.00
	jsonData.droneCCDParams[i].tangentalT3 = 0.00
    }

    //console.log(jsonData)
}

// Function to format the timestamp with the desired format
// of linux date command; chatgpt wrote this over
// 5-10 iterations
// date command output does not contain underscore between time and am/pm.
// when cut/paste the output of this program into emacs, an underscore
// appears; I think its terminal and cut/paste not the program

function formatTimestamp(date) {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayOfWeek = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/_/g, ' ');
  const timeZone = date.toLocaleString('en-US', { timeZoneName: 'short' }).split(' ')[2];

  return `${dayOfWeek} ${month} ${day} ${time} ${timeZone} ${year}`;
}

// Usage: Pass the filename as a command-line argument
if (process.argv.length < 4) {
    console.error('node updateDroneModels.js infile outfile')
  process.exit(1);
}

const infilename = process.argv[2];
const outfilename = process.argv[3];

readJSONFile(infilename, (err, data) => {
  if (err) {
    console.error('An error occurred while reading the JSON file');
    return;
  }

    //console.log('JSON data:', data);

    console.log("JSON data file date is "+ data.lastUpdate);
    console.log("JSON droneCCDParams has "+data.droneCCDParams.length+" drone models")

    updateDroneParams(data)
    var theDateString = formatTimestamp(new Date())
    console.log("Lastupdate "+theDateString)

    data.lastUpdate = theDateString
        
    console.log("Back from updateDroneParams")

    writeJSONToFile(outfilename,data, (err,data) => {
	if (err) {
	    console.error("Error writing JSON file");
	    return;
	}
    })
});

