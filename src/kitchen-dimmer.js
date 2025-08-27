//-----------------------------------
// Script for Kitchen Sink Light Rail
//-----------------------------------
// - Shelly Dimmer Gen3
// - Input mode: Switch Detatched
// - Single button press -> Light on/of
// - Long button press when light is on -> Light dimms to 20%

const tapThresholdMs = 500;
const dimmBrightness = 20;

var isOn = false;
var pressTimer = null;
var turnOnRunning = false;

function setBrightness(brightness) {
  isOn = (brightness > 0);
  Shelly.call("Light.Set", {
          "id": 0, 
          "on": isOn, 
          "brightness": brightness
        });
}

function handleButton(pressed) {
    if (pressed === true) {
      print("Button was pressed");
            
      if(!isOn) {
        print("Light is off - turn on immediately");
        turnOnRunning = true;
        setBrightness(100);
        return;
      }
      
      pressTimer = Timer.set(tapThresholdMs, false, function() {
        pressTimer = null;
        print("Button held down a while - dimm");

        setBrightness(dimmBrightness);
      });
    }
    else if (pressed === false) {
      print("Button was released");

      if(turnOnRunning) {
        turnOnRunning = false;
        return;
      }
      if (pressTimer !== null) {
        Timer.clear(pressTimer);
        pressTimer = null;

        if(isOn) {
          print("Button was pressed shorty while light was on - turn off");  
          setBrightness(0);
        } else {
          print("Button was pressed shorty while light was off - turn on"); 
          setBrightness(100);
        }
      }
    }
};

print("Script started")

Shelly.call("Light.GetStatus", {"id": 0}, function (response, error_code, error_message, ud) {

  isOn = response.output

  print("Register Event handler");
  Shelly.addStatusHandler(function(e) {
    if (e.component !== "input:0") {
      //print("Unknown input event -> Ignore");
      return; 
    }
    
    handleButton(e.delta.state);
  });
});