import React, { Component } from 'react';
import '../App.css';
import Cropper from 'cropperjs';
import "cropperjs/dist/cropper.min.css";
import Paper from '@mui/material/Paper'; // Updated import
import Button from '@mui/material/Button'; // Updated import

class Editor extends Component {
  constructor() {
    super();
    this.state = {
      equalized: false,
      oldImages: [],
      imageDestination: null,
    };
    this.srcRef = React.createRef();
    this.cnvRef = React.createRef();
    this.cropper = null;
  }

  handleChange = async () => {
    this.clearCanvas();
    if (this.props.img) {
      this.srcRef.current.src = this.props.img;
      this.setState({ oldImages: [] });
    }
  };

  clearCanvas = () => {
    if (this.cropper) {
      this.cropper.destroy();
    }
    const canvas = this.cnvRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  handleDownload = () => {
    const canvas = this.cnvRef.current;
    const link = document.createElement('a');
    link.download = 'new_image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  getImage = () => {
    if (this.props.img) {
      const canvas = this.cnvRef.current;
      return canvas.toDataURL();
    } else {
      return null;
    }
  };

  backupImage = () => {
    const canvas = this.cnvRef.current;
    const image = canvas.toDataURL("image/png");
    const oldImage = {
      image,
      equalized: this.state.equalized,
    };
    this.setState((state) => ({
      oldImages: state.oldImages.concat(oldImage),
    }));
  };

  undoChange = () => {
    const oldImages = this.state.oldImages;
    if (oldImages.length > 0) {
      const lastImage = oldImages.pop();
      this.clearCanvas();
      this.srcRef.current.src = lastImage.image;
      this.setState({
        oldImages: oldImages,
        equalized: lastImage.equalized,
      });
    }
  };

  componentDidMount() {
    if (this.props.img) {
      this.srcRef.current.src = this.props.img;
    }
  }

  imgLoad = () => {
    this.drawImage();
  };

  drawImage = () => {
    const image = this.srcRef.current;
    const canvas = this.cnvRef.current;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    this.enableCrop();
  };

  enableCrop = () => {
    const canvas = this.cnvRef.current;
    this.cropper = new Cropper(canvas, {
      zoomable: true,
      autoCrop: false,
      background: false,
    });
  };

  getCropped = () => {
    this.backupImage();
    const cropped = this.cropper.getCroppedCanvas();
    const newImage = cropped.toDataURL("image/png");
    this.clearCanvas();
    this.srcRef.current.src = newImage;
  };

  handleRotate = () => {
    this.cropper.rotate(90);
  };

  handleCrop = () => {
    this.cropper.setDragMode('crop');
  };

  handleMove = () => {
    this.cropper.setDragMode('move');
  };

  cleanSelection = () => {
    this.cropper.reset();
    this.cropper.clear();
  };

  handleZoom = () => {
    this.cropper.zoomable = true;
    this.cropper.zoomOnWheel = true;
  };

  equalize = () => {
    this.backupImage();
    this.cropper.destroy();
    /*global cv*/
    const image = this.srcRef.current;
    const canvas = this.cnvRef.current;
    let mat = cv.imread(image);
    let dst = new cv.Mat();
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);

    cv.equalizeHist(mat, dst);
    cv.imshow(canvas, dst);
    this.enableCrop();
    this.setState({ equalized: true });
  };

  applyFilter = () => {
    const canvas = this.cnvRef.current;
    const ctx = canvas.getContext("2d");
    const filterType = this.props.filterType;
    const filterIntensity = this.props.filterIntensity;
    if (filterType === 'grayscale') {
      ctx.filter = `grayscale(${filterIntensity}%)`;
    } else if (filterType === 'sepia') {
      ctx.filter = `sepia(${filterIntensity}%)`;
    } else {
      ctx.filter = 'none';
    }
    ctx.drawImage(this.srcRef.current, 0, 0);
  };

  render() {
    return (
      <div>
        <Paper className={"img-container"}>
          <canvas id='src' ref={this.cnvRef} />
        </Paper>
        <div>
          <img ref={this.srcRef} width='50%' style={{ display: 'none' }} onLoad={this.imgLoad} />
        </div>
        <Paper className={"buttons"}>
          <Button variant="outlined" onClick={this.handleCrop}>
            Selection
          </Button>
          <Button variant="outlined" onClick={this.handleMove}>
            Resize/Move
          </Button>
          <Button variant="outlined" onClick={this.equalize}>
            Process
          </Button>
          <Button variant="outlined" onClick={this.handleRotate}>
            Rotate
          </Button>
          <Button variant="outlined" onClick={this.cleanSelection}>
            Clear selection
          </Button>
          <Button variant="outlined" onClick={this.getCropped}>
            Crop
          </Button>
          {this.state.oldImages.length ? (
            <Button onClick={this.undoChange}>Undo</Button>
          ) : null}
          <Button variant="outlined" onClick={this.applyFilter}>
            Apply Filter
          </Button>
          <Button variant="outlined" onClick={this.handleZoom}>
            Zoom
          </Button>
          <Button variant="outlined" onClick={this.handleDownload}>
            Download
          </Button>
        </Paper>
      </div>
    );
  }
}

export default Editor;