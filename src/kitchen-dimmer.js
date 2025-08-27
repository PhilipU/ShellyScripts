const tapThresholdMs = 500;
const dimmBrightness = 20;

var isOn = false;
var pressTimer = null;
var turnOnRunning = false;

function handleButton(pressed) {
    if (pressed === true) {
      print("Button was pressed");
            
      if(!isOn) {
        print("Light is off - turn on immediately");
        isOn = true;
        turnOnRunning = true;
        Shelly.call("Light.Set", {
              "id": 0, 
              "on": true,
              "brightness": 100
              });
        return;
      }
      
      pressTimer = Timer.set(tapThresholdMs, false, function() {
        pressTimer = null;
        print("Button held down a while - dimm");

        Shelly.call("Light.Set", {
          "id": 0, 
          "on": isOn, 
          "brightness": dimmBrightness
        });
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
          isOn = false;   
          Shelly.call("Light.Set", {
                "id": 0, 
                "on": false,
                "brightness": 0
                });
        } else {
          print("Button was pressed shorty while light was off - turn on");
          isOn = true;   
          Shelly.call("Light.Set", {
                "id": 0, 
                "on": true, 
                });
        }
      }
    }
};

print("Script started")

Shelly.call("Light.GetStatus", {"id": 0}, function (response, error_code, error_message, ud) {

  brightness = response.brightness * 0.01;
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