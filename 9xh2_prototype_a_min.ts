interface PipelineStage {
  id: string;
  name: string;
  type: 'source' | 'build' | 'test' | 'deploy' | 'release';
  dependencies: string[];
  script: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'binary' | 'config';
  data: string;
}

interface SimulatorState {
  pipelines: Pipeline[];
  artifacts: Artifact[];
  currentPipeline: Pipeline | null;
  currentStage: PipelineStage | null;
}

class PipelineSimulator {
  state: SimulatorState;

  constructor() {
    this.state = {
      pipelines: [],
      artifacts: [],
      currentPipeline: null,
      currentStage: null,
    };
  }

  addPipeline(pipeline: Pipeline): void {
    this.state.pipelines.push(pipeline);
  }

  addArtifact(artifact: Artifact): void {
    this.state.artifacts.push(artifact);
  }

  startPipeline(pipelineId: string): void {
    const pipeline = this.state.pipelines.find((p) => p.id === pipelineId);
    if (pipeline) {
      this.state.currentPipeline = pipeline;
      this.state.currentStage = pipeline.stages[0];
    }
  }

  nextStage(): void {
    if (this.state.currentStage) {
      const currentIndex = this.state.currentPipeline.stages.indexOf(this.state.currentStage);
      if (currentIndex < this.state.currentPipeline.stages.length - 1) {
        this.state.currentStage = this.state.currentPipeline.stages[currentIndex + 1];
      } else {
        this.state.currentPipeline = null;
        this.state.currentStage = null;
      }
    }
  }

  get currentStageStatus(): string {
    if (this.state.currentStage) {
      return `Running stage ${this.state.currentStage.name}`;
    } else {
      return 'Pipeline completed';
    }
  }
}

const simulator = new PipelineSimulator();

// Example usage
const pipeline: Pipeline = {
  id: 'my-pipeline',
  name: 'My Pipeline',
  stages: [
    {
      id: 'src',
      name: 'Source',
      type: 'source',
      dependencies: [],
      script: 'git clone https://github.com/my-repo.git',
    },
    {
      id: 'build',
      name: 'Build',
      type: 'build',
      dependencies: ['src'],
      script: 'npm run build',
    },
    {
      id: 'deploy',
      name: 'Deploy',
      type: 'deploy',
      dependencies: ['build'],
      script: 'ssh deploy@remote-server "deploy.sh"',
    },
  ],
};

simulator.addPipeline(pipeline);
simulator.startPipeline('my-pipeline');
console.log(simulator.currentStageStatus); // Output: Running stage Source
simulator.nextStage();
console.log(simulator.currentStageStatus); // Output: Running stage Build
simulator.nextStage();
console.log(simulator.currentStageStatus); // Output: Running stage Deploy
simulator.nextStage();
console.log(simulator.currentStageStatus); // Output: Pipeline completed