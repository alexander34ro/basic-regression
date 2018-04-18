'use strict';

// Parameters
var generations;
var populationSize;
var momentumF; // amplifies movement to a particle's previous direction
var cognitiveF; // amplifies movement to a particle's best position
var socialF; // amplifies movement to a particle's best neighbour
var totalF; // sum of the other factors
var dimensions;
var dimensionsSizes;

// Additional parameters
var divisionF = 2; // how fast to slow down
var replacementF = 0.12; // the % of particles to replace

// Data
var rawData;
var regression;

// For Gradient descent
var learningRate = 0.000002;

// Data points
var swarm;
var bestParticle;
var bestFitness;
var currentFitness;

// For the chart
var minChart = null;

// For function part
function initialize() {
  initializeChart();
  initializeParameters();

  rawData = getData();
  dimensions = getFunctionInputData(rawData[0]).length;
  dimensionsSizes = new Array(dimensions).fill(5);

  generatePopulation();
  while (generations > 0) {
    newGeneration();
  }
}

function initializeParameters() {
  generations = parseInt($('#generations').val());
  console.log('generations: ' + generations);
  populationSize = parseInt($('#population_size').val());
  console.log('populationSize: ' + populationSize);
  momentumF = parseFloat($('#momentum_factor').val());
  console.log('momentumF: ' + momentumF);
  cognitiveF = parseFloat($('#cognitive_factor').val());
  console.log('cognitiveF: ' + cognitiveF);
  socialF = parseFloat($('#social_factor').val());
  console.log('socialF: ' + socialF);
  totalF = (momentumF + cognitiveF + socialF) / divisionF;
  console.log('totalF: ' + totalF);
  dimensionsSizes = [];
}

function aFunction(x, weights) {
  return x.reduce((r, value, index) => r + value * weights[index], 0);
}

// Custom Swarm Particle
// Starts in a random position
// With a random velocity
// Remembers it's best position and fitness
// Has a fitness, how good it is performing
// Has a dispersion, how far it is from the rest of the swarm(to avoid local minimum)
function Particle(initialPosition, initialVelocity) {
  this.position = initialPosition;
  this.velocity = initialVelocity;
  this.bestPosition = null;
  this.bestFitness = null;
  this.fitness = 0;
  this.dispersion = 0;
}

// For function part
function generateParticle() {
  // initialize random starting position and velocity
  let limit;
  let position = [],
    velocity = [];
  let p, v;
  for (let i = 0; i < dimensions; i++) {
    limit = dimensionsSizes[i];
    p = Math.random() * limit; // initial position must be within bounds
    v = Math.random() * limit - p; // initial velocity as change in position
    position.push(p);
    velocity.push(v);
  }
  return new Particle(position, velocity);
}

function generatePopulation() {
  swarm = [];
  bestParticle = null;
  bestFitness = null;
  for (let i = populationSize; i--; ) {
    swarm.push(generateParticle());
  }
  let initialSwarm = JSON.parse(JSON.stringify(swarm));
  console.log('initial swarm: ');
  console.log(initialSwarm);
}

function newGeneration() {
  generations = generations - 1;

  attributeFitness();
  addDataToChart();
  moveSwarm();
  replaceWeakParticles();

  let currentSwarm = JSON.parse(JSON.stringify(swarm));
  console.log('swarm:');
  console.log(currentSwarm);
}

// in this case, the lower the fitness the better(it's a minimum problem)
function attributeFitness(fitnessFunction) {
  bestParticle = null;
  let particle, fitness, position, node;
  for (let i = populationSize; i--; ) {
    particle = swarm[i];
    position = particle.position;
    fitness = Math.abs(
      rawData[generations].Total_UPDRS -
        aFunction(getFunctionInputData(rawData[generations]), position)
    );
    particle.fitness = fitness;
  }

  // sort particles by fitness
  swarm.sort((p1, p2) => p1.fitness - p2.fitness);

  particle = swarm[0];
  fitness = particle.fitness;
  if (bestParticle == null || fitness < bestParticle.fitness) {
    bestParticle = particle;
    currentFitness = fitness;
  }
  if (bestFitness == null || fitness < bestFitness) {
    bestFitness = fitness;
  }

  let currentBestParticle = JSON.parse(JSON.stringify(bestParticle));
  console.log('best particle:');
  console.log(currentBestParticle);

  addDataToChart(
    Math.abs(
      rawData[generations].Total_UPDRS -
        aFunction(
          getFunctionInputData(rawData[generations]),
          currentBestParticle.position
        )
    )
  );
  regression = bestParticle.position;
}

function moveSwarm() {
  let particle;
  let position, previousPosition;
  let velocity, previousV, cognitiveV, socialV;
  let limit;
  for (let i = populationSize; i--; ) {
    particle = swarm[i];
    previousPosition = particle.position.slice(); // keep for best position
    // get cognitive and social directions for each dimension
    for (let j = 0; j < dimensions; j++) {
      previousV = particle.velocity[j];

      // in case the particle has no previous position
      if (particle.bestPosition == null) {
        cognitiveV = 0;
      } else {
        // the chage in position from the current to the best position of this particle
        cognitiveV = particle.bestPosition[j] - particle.position[j];
      }

      // the chage in position from the current position to the best global position
      socialV = bestParticle.position[j] - particle.position[j];

      // calculate velocity
      velocity = Math.floor(
        (momentumF * previousV + cognitiveF * cognitiveV + socialF * socialV) /
          totalF
      );
      position = particle.position[j];
      limit = dimensionsSizes[j] - 1;
      if (position + velocity > limit) {
        velocity = limit - position;
      } else if (position + velocity < 0) {
        velocity = -position;
      }
      // update velocity
      particle.velocity[j] = velocity;
      // update position
      particle.position[j] = position + velocity;
    }

    // update best position and fitness of the particle
    if (
      particle.bestFitness == null ||
      particle.fitness < particle.bestFitness
    ) {
      particle.bestFitness = particle.fitness;
      particle.bestPosition = previousPosition;
    }
  }
}

function replaceWeakParticles() {
  let particlesToReplace = Math.floor(populationSize * (1 - replacementF));
  for (let i = populationSize - 1; i >= particlesToReplace; i--) {
    swarm[i] = generateParticle();
  }
}

// Chart functions
function addDataToChart(data) {
  minChart.data.labels.push('');
  minChart.data.datasets.forEach(dataset => {
    dataset.data.push(data);
  });
  minChart.update();
}

function initializeChart() {
  if (minChart != null) minChart.destroy();
  minChart = new Chart(
    document.getElementById('minimum-chart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Error',
            data: [],
            backgroundColor: ['rgba(54, 142, 160, 0.2)'],
            borderColor: ['rgba(54, 142, 160, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {}
    }
  );
}

function trainUsingSmallestSquares() {
  //debugger;
  initializeChart();
  rawData = getData();
  let size = Math.floor((rawData.length - 1) / 8);
  let i = size;
  let inputMatrix = rawData
    .slice(0, size)
    .map(x => Object.values(getFunctionInputData(x)));
  console.log(inputMatrix);
  let transposedInputMatrix = transpose(inputMatrix);
  console.log(transposedInputMatrix);
  let combinedInputMatrix = math.multiply(transposedInputMatrix, inputMatrix);
  /*multiplyMatrices(
    transposedInputMatrix,
    inputMatrix
  );*/
  console.log(combinedInputMatrix);
  let inversedInputMatrix = math.inv(combinedInputMatrix);
  console.log(inversedInputMatrix);
  let transposedInversedMatrix = math.multiply(
    inversedInputMatrix,
    transposedInputMatrix
  );
  console.log(transposedInversedMatrix);
  let resultsVector = rawData.slice(0, size).map(x => x.Total_UPDRS);
  console.log(resultsVector);
  let solution = math.multiply(transposedInversedMatrix, resultsVector);
  console.log(solution);
  regression = solution;
}

function transpose(matrix) {
  return matrix[0].map(function(col, c) {
    // For each column, iterate all rows
    return matrix.map(function(row, r) {
      return matrix[r][c];
    });
  });
}

function trainUsingGradientDescent() {
  //debugger;
  initializeChart();
  rawData = getData();
  let size = Math.floor((rawData.length - 1) / 8);
  let i = size;
  let hypothesis = getFunctionInputData(rawData[i]);
  let weights = new Array(hypothesis.length).fill(0);
  let error = -rawData[i].Total_UPDRS;
  for (; i--; ) {
    hypothesis = getFunctionInputData(rawData[i]);
    let newError = -rawData[i].Total_UPDRS;
    for (let j = hypothesis.length; j--; ) {
      let weightAdjustment = learningRate * error * hypothesis[j];
      weights[j] -= weightAdjustment;
      let errorAdjustment = weights[j] * hypothesis[j];
      newError += errorAdjustment;
    }
    error = newError;
    console.log(weights);
    console.log(error);
    addDataToChart(error);
  }
  regression = weights;
}

function trainUsingGeneticAlgorithm() {
  initialize();
}

function getFunctionInputData(data) {
  let hypothesis = deepCopy(data);
  hypothesis.Subject = null;
  hypothesis.Total_UPDRS = null;
  hypothesis.Sex = null;
  hypothesis = Object.values(hypothesis).filter(n => n != null);
  hypothesis.push(1);
  return hypothesis;
}

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

function train() {
  if ($('#method').val() == '1') {
    trainUsingSmallestSquares();
  } else if ($('#method').val() == '2') {
    trainUsingGradientDescent();
  } else if ($('#method').val() == '3') {
    trainUsingGeneticAlgorithm();
  }
}

function test() {
  let weights = regression;
  let size = Math.floor((rawData.length - 1) / 8);
  let i = size;
  rawData.shift(size);
  let totalError = 0;
  for (; i--; ) {
    let hypothesis = getFunctionInputData(rawData[i]);
    let error = -rawData[i].Total_UPDRS;
    for (let j = hypothesis.length; j--; ) {
      let errorAdjustment = weights[j] * hypothesis[j];
      error += errorAdjustment;
    }
    addDataToChart(error);
    error = Math.abs(error) / rawData[i].Total_UPDRS * 100;
    console.log(error);
    totalError += error;
  }
  console.log('Accuracy: ');
  let accuracy = Math.abs(100 - totalError / size);
  console.log(accuracy);
  $('#accuracy').html(accuracy);
}

// Main
$('document').ready(function() {
  $('#learn').on('click', train);
  $('#test').on('click', test);
  $('#method').on('change', () => $('#' + $('#method').val()).click());
  initializeChart();
});
