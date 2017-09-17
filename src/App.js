import React, { Component } from 'react';
import * as ReactKonva from 'react-konva';
import {Button} from 'react-bootstrap';
import './App.css';

import GardenOriginal from './images/garden_original.jpg';
import GardenShifted from './images/garden_neg_5_deg_20px_left_shift.jpg';

const HEIGHT = 300;
const WIDTH = 400;

//PIXEL INSPECTION POINT
const PIP = [[100,150], [200, 150], [300, 150], [200,75], [200,225]];

class App extends Component {
	constructor(){
		super();
		this.state = {
			
		};
		this.findShift = this.findShift.bind(this);
		this.convertToGrayscale = this.convertToGrayscale.bind(this);
		this.displaySampleAreas = this.displaySampleAreas.bind(this);
	}
	
	convertToGrayscale(){
		let c = this.refs.originalImage.getContext('2d');
		let imageData = c.getImageData(0, 0, 800, 600); 

		for (let i = 0; i < imageData.data.length; i += 4) {
      let avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i]     = avg; // red
      imageData.data[i + 1] = avg; // green
      imageData.data[i + 2] = avg; // blue
    }
    c.putImageData(imageData);
		this.displaySampleAreas();
		this.findShift();
	}
	
	displaySampleAreas(){
		let c = this.refs.originalImage.getContext('2d');
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIP[0][0], PIP[0][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIP[1][0], PIP[1][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIP[2][0], PIP[2][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIP[3][0], PIP[3][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIP[4][0], PIP[4][1], 6, 6);
		c.stroke();
	}
	
	findShift(){
		let c = this.refs.originalImage.getContext('2d');
		//create an average over a 3x3 grid of pixels at the 5 designated points
		
		
	}
	
  render() {
		const originalImage = new window.Image();
		const shiftedImage = new window.Image();
		originalImage.src = GardenOriginal;
		shiftedImage.src = GardenShifted;
		
    return (
      <div className="App">
				<ReactKonva.Stage height={HEIGHT} width={WIDTH} style={{display:"inline-block"}} >
					<ReactKonva.Layer style={{textAlign:"center"}}>
						<ReactKonva.Image ref="originalImage" image={originalImage} 
																									height={HEIGHT} 
																									width={WIDTH} />
			    </ReactKonva.Layer>
				</ReactKonva.Stage>
				<ReactKonva.Stage height={HEIGHT} width={WIDTH}  style={{display:"inline-block"}}>
					<ReactKonva.Layer style={{textAlign:"center"}}>
						<ReactKonva.Image ref="shiftedImage" image={shiftedImage} 
																								 height={HEIGHT} 
																								 width={WIDTH} />
			    </ReactKonva.Layer>
				</ReactKonva.Stage>
				<div style={{marginTop: "20px"}}>
					<Button onClick={this.convertToGrayscale}>CONVERT TO GRAYSCALE</Button><br />
					<Button onClick={this.findShift}>FIND SHIFT</Button><br />
				</div>														 
      </div>
    );
  }
}

export default App;
