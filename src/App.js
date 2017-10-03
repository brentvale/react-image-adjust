import React, { Component } from 'react';
import * as ReactKonva from 'react-konva';
import {Button} from 'react-bootstrap';
import './App.css';

import GardenOriginal from './images/garden_original.jpg';
import GardenShifted from './images/garden_neg_5_deg_20px_left_shift.jpg';
import GardenShiftedLeftOnly from './images/garden_left_shift.jpg';

const HEIGHT = 300;
const WIDTH = 400;
const GRID_SIZE = 3;

//PIXEL INSPECTION POINTS
const PIPS = [[200,75], [100,150], [200, 150], [300, 150], [200,225]];

class App extends Component {
	constructor(){
		super();
		this.state = {
			samplePoints: null,
			grayscaleImageDataOriginal: null,
			grayscaleImageDataShifted: null,
			grayscaleShiftedRotation: 0
		};
		this.convertToGrayscale = this.convertToGrayscale.bind(this);
		this.createPointsEnlargedDisplay = this.createPointsEnlargedDisplay.bind(this);
		this.displaySampleAreas = this.displaySampleAreas.bind(this);
		this.getSum = this.getSum.bind(this);
		this.getTargetData = this.getTargetData.bind(this);
		this.findNearestNinePointInImage = this.findNearestNinePointInImage.bind(this);
		this.findShift = this.findShift.bind(this);
		this.rotateLeft = this.rotateLeft.bind(this);
		this.rotateRight = this.rotateRight.bind(this);
		this.showEnlargedSamplingAreas = this.showEnlargedSamplingAreas.bind(this);
		this.showMatchesOnShifted = this.showMatchesOnShifted.bind(this);
	}
	
	convertToGrayscale(){
		let c = this.refs.originalImage.getContext('2d');
		let cShifted = this.refs.shiftedImage.getContext('2d');
		
		let imageData = c.getImageData(0, 0, 800, 600); 
		let imageDataShifted = cShifted.getImageData(0, 0, 800, 600); 

		for (let i = 0; i < imageData.data.length; i += 4) {
			
      let avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
			
			let avgShifted = (imageDataShifted.data[i] + imageDataShifted.data[i + 1] + imageDataShifted.data[i + 2]) / 3;
			
      imageData.data[i]     = avg; // red
      imageData.data[i + 1] = avg; // green
      imageData.data[i + 2] = avg; // blue
			
      imageDataShifted.data[i]     = avgShifted; // red
      imageDataShifted.data[i + 1] = avgShifted; // green
      imageDataShifted.data[i + 2] = avgShifted; // blue
    }
		this.setState({grayscaleImageDataOriginal: imageData, grayscaleImageDataShifted: imageDataShifted});
	}
	
	createPointsEnlargedDisplay(){
		let c = this.refs.grayscaleOriginal.getContext('2d');
		//array containing data for each of the sampling points on the image
		let pointsValues = [];
		//create an average over a GRID_SIZE x GRID_SIZE grid of pixels at the designated points (from PIPS)
		for(let i = 0; i < PIPS.length; i ++){
			let startX = PIPS[i][0];
			let startY = PIPS[i][1];
			//find values around this one point
			let imageData = c.getImageData(startX, startY, GRID_SIZE, GRID_SIZE);
			pointsValues.push(imageData);
		}

		this.setState({samplePoints: pointsValues});
	}
	
	displayPossibleMatchAreasOnShifted(){
		
	}
	
	displaySampleAreas(){
		let c = this.refs.grayscaleOriginal.getContext('2d');
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIPS[0][0], PIPS[0][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIPS[1][0], PIPS[1][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIPS[2][0], PIPS[2][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIPS[3][0], PIPS[3][1], 6, 6);
		c.strokeStyle = "red";
		c.lineWidth = 3;
		c.strokeRect(PIPS[4][0], PIPS[4][1], 6, 6);
		c.stroke();
	}
	
	findShift(){
		this.findNearestNinePointInImage();
		//start at center point
		
	}
	
	getSum(data){
		let sum = 0;
		//rgbs values for grayscale are the same for all 3 values so just look at first one (as iterating through
		//array 4 at a time)
		for(let i = 0; i < data.length; i+=4){
			sum += data[i];
		}
		return sum;
	}
	
	getTargetData(imageData){
		let sum = this.getSum(imageData.data);
		return {total: sum, data: imageData.data};
	}
	
	findNearestNinePointInImage(){
		let cS = this.refs.grayscaleShifted.getContext('2d');
		let cO = this.refs.grayscaleOriginal.getContext('2d');
		
		//keep track of all the 3x3s that have the exact same value
		// let countOfIdenticals = 0;
		//array of 3x3s that are almost identical
		let possibleMatches = [];
		
		let imageData = cO.getImageData(200,150,3,3);
		
		//{total: #sum of 9 squares, data: [imageData.data]}
		const { total, data } = this.getTargetData(imageData)
		//using i and j jumping up by 3 each increment produces : 53400 that have identical values
		//and runs for 17 seconds
		
		for(var i = 150; i < 250; i+=1){
			for(var j = 100; j < 200; j += 1){
				let idx = i;
				let jdx = j;
				let target = this.getSum(cS.getImageData(idx,jdx,3,3).data);
				//with absolute value < 4 => identicals in range of 100 around center is 8
				//with absolute value < 3 => identicals in range of 100 around center is 6
				//with absolute value < 2 => identicals in range of 100 around center is 4
				if(Math.abs(target-total) < 1){
					possibleMatches.push({idx: idx, jdx: jdx, shiftedData: cS.getImageData(idx,jdx,3,3).data, originalData: data});
				}
			}
		}
		this.showMatchesOnShifted(possibleMatches);
	}
	
	rotateLeft(){
		this.setState({grayscaleShiftedRotation: -1 });
	}
	
	rotateRight(){
		this.setState({grayscaleShiftedRotation: 1 });
	}

	totalDifference(obj){
		let deltaSum = 0;
		//for each of the 9 values, calculate the difference in values at a single spot
		for(var i = 0; i < obj.originalData.length; i +=4){
			const delta = Math.abs(obj.originalData[i] - obj.shiftedData[i]);
			deltaSum += delta;
		}
		return deltaSum;
	}
	
	showMatchesOnShifted(possibleMatches){
		let c = this.refs.grayscaleShifted.getContext('2d');
		//lowest difference between the individual values that make up the different points on the array
		let overAllHighest = null;
		//keep track of the IDX and JDX values at the overallHighest and overallLowest to draw blue box
		let highestIdx = -1;
		let highestJdx = -1;
		
		let overAllLowest = null;
		let lowestIdx = -1;
		let lowestJdx = -1;
		
		for(let i = 0; i < possibleMatches.length; i ++){
			
			const targetDiff = this.totalDifference(possibleMatches[i]);
			
			if(overAllLowest == null || targetDiff < overAllLowest){
				overAllLowest = targetDiff;
				lowestIdx = possibleMatches[i].idx;
				lowestJdx = possibleMatches[i].jdx;
			}
			if(overAllHighest == null || targetDiff > overAllHighest){
				overAllHighest = targetDiff;
				highestIdx = possibleMatches[i].idx;
				highestJdx = possibleMatches[i].jdx;
			}
			
			c.strokeStyle = "red";
			c.lineWidth = 3;
			c.strokeRect(possibleMatches[i].idx, possibleMatches[i].jdx, 6, 6);
		}
		//overall lowest difference between values is the one that matches closest
		// c.strokeStyle = "blue";
// 		c.lineWidth = 3;
// 		c.strokeRect(200, 150, 6, 6);
		
		c.stroke();
		
		alert(`
horizontal shift is ${200 - lowestIdx} ${(200 - lowestIdx <= 0) ? "to the left" : "to the right"}
vertical shift is ${150 - lowestJdx} ${(150 - lowestJdx <= 0) ? "move up" : "move down"}`)

		// setTimeout(() => {
// 			//color over background
// 			c.rect(0,0,400,300);
// 			c.fillStyle = "white";
// 			c.fill();
//
// 			c.putImageData(this.state.grayscaleImageDataShifted, (200 - lowestIdx), (150 - lowestJdx), 800, 600);
// 			for(let i = 0; i < possibleMatches.length; i ++){
// 				c.strokeStyle = "red";
// 				c.lineWidth = 3;
// 				c.strokeRect(possibleMatches[i].idx, possibleMatches[i].jdx, 6, 6);
// 			}
// 			c.strokeStyle = "blue";
// 			c.lineWidth = 3;
// 			c.strokeRect(200, 150, 6, 6);
//
// 			c.stroke();
// 		}, 2000)
		
	}
	
	showEnlargedSamplingAreas(){
		let display = [];
		let points = this.state.samplePoints.slice(0);
		let key = 0;
		let rowKey = 0;
		let containersKey = 0;
		for(let i = 0; i < points.length; i++){
			let data = points[i].data;
			let tempDisplay = [];
			let innerDivs = [];
			for(let j = 0; j < data.length; j+=4){
				
				innerDivs.push(<div key={key}
														style={{ flex: "1", 
																			flexFlow: 'row wrap',
																			height: "100%",
																			backgroundColor: `rgb(${data[j]}, ${data[j+1]}, ${data[j+2]})`}}></div>);	
				key += 1;
				
				if((j+1) % GRID_SIZE === 0){
					tempDisplay.push(<div key={rowKey} 
																style={{flex: "1",
																				flexDirection: "row",
																				display: "flex"}}>
																{innerDivs}
													 </div>);
					rowKey += 1;
					innerDivs = [];
				}
				
			}
			let container = <div key={containersKey}
														style={{height: "40px", 
																		width: "40px", 
																		display: 'flex',
																		flexDirection: 'column'}}>
												{tempDisplay}
											</div>;
			containersKey += 1;
			display.push(container);
			
		}
		return display;
	}
	
  render() {
		const originalImage = new window.Image();
		const shiftedImage = new window.Image();
		
		originalImage.src = GardenOriginal;
		shiftedImage.src = GardenShifted;
		
		let displayPoints;
		if(this.state.samplePoints == null){
			displayPoints = "";
		} else {
			displayPoints = this.showEnlargedSamplingAreas();
		}
	
		if(this.state.grayscaleImageDataOriginal){
			let c = this.refs.grayscaleOriginal.getContext('2d');
			c.putImageData(this.state.grayscaleImageDataOriginal, 0, 0, 800, 600);
			this.displaySampleAreas();
		}
		
		if(this.state.grayscaleImageDataShifted){
			let c = this.refs.grayscaleShifted.getContext('2d');
			let ctx = this.refs.grayscaleShiftedRotatable.getContext('2d');
			
			c.putImageData(this.state.grayscaleImageDataShifted, 0, 0, 800, 600);
			
			ctx.drawImage(shiftedImage, 0, 0, 400, 300);
			ctx.rotate(this.state.grayscaleShiftedRotation * Math.PI / 180);
		}
    return (
      <div className="App">
				<div style={{display: "flex", flex: "1", flexDirection: 'row'}}>
					<ReactKonva.Stage height={HEIGHT} width={WIDTH} style={{display:"flex", flex: "1"}} >
						<ReactKonva.Layer style={{textAlign:"center"}}>
							<ReactKonva.Image ref="originalImage" image={originalImage} 
																										height={HEIGHT} 
																										width={WIDTH} />
				    </ReactKonva.Layer>
					</ReactKonva.Stage>
																						
																						
					<ReactKonva.Stage height={HEIGHT} width={WIDTH} style={{display:"flex", flex: "1"}} >
						<ReactKonva.Layer style={{textAlign:"center"}}>
							<ReactKonva.Image ref="grayscaleOriginal" height={HEIGHT} 
																												width={WIDTH} />
				    </ReactKonva.Layer>
					</ReactKonva.Stage>
							
					<div style={{display:'flex', height: '300px', width: '400px', flex: "1", justifyContent: 'center'}}>
							{displayPoints}
					</div>
				</div>
							
				<div style={{display: "flex", flex: "1", flexDirection: 'row'}}>
					<ReactKonva.Stage height={HEIGHT} width={WIDTH}  style={{display:"flex", flex: "1"}}>
						<ReactKonva.Layer style={{textAlign:"center"}}>
							<ReactKonva.Image ref="shiftedImage" image={shiftedImage} 
																									 height={HEIGHT} 
																									 width={WIDTH} />
				    </ReactKonva.Layer>
					</ReactKonva.Stage>
					<ReactKonva.Stage height={HEIGHT} width={WIDTH} style={{display:"flex", flex: "1"}} >
						<ReactKonva.Layer style={{textAlign:"center"}}>
							<ReactKonva.Image ref="grayscaleShifted"  height={HEIGHT} 
																												width={WIDTH} />
				    </ReactKonva.Layer>
					</ReactKonva.Stage>
							
					<ReactKonva.Stage height={HEIGHT} width={WIDTH} style={{display:"flex", flex: "1"}} >
						<ReactKonva.Layer style={{textAlign:"center"}}>
							<ReactKonva.Image ref="grayscaleShiftedRotatable"  height={HEIGHT} 
																												width={WIDTH} />
				    </ReactKonva.Layer>
					</ReactKonva.Stage>
				</div>													
				
																								 
				<div style={{marginTop: "20px"}}>
					<Button onClick={this.convertToGrayscale}>CONVERT TO GRAYSCALE</Button><br />
					<Button onClick={this.createPointsEnlargedDisplay}>CREATE ENLARGED SAMPLING AREA</Button><br />
					<Button onClick={this.rotateLeft}>Rotate Left</Button><br />
					<Button onClick={this.rotateRight}>Rotate Right</Button><br />
							
					<Button onClick={this.findShift}>FIND SHIFT</Button><br />
				</div>														 
      </div>
    );
  }
}

export default App;
