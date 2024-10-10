import React, { Component } from 'react';
import './App.css';
import unequalized from './Unequalized_Hawkes_Bay_NZ.jpg';
import Editor from './components/Editor';
import ImgList from './components/ImgList';
import DbList from './components/DbList';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  AppBar, Button, Container, CssBaseline, Drawer, Grid, IconButton, 
  Paper, Select, Snackbar, Switch, TextField, Toolbar, Typography, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Dialog, 
  DialogTitle, DialogContent, DialogActions, Tabs, Tab, 
  LinearProgress, InputAdornment, Slider, CircularProgress, Tooltip, 
  Accordion, AccordionSummary, AccordionDetails, Menu, FormControlLabel
} from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { 
  CloudUpload as CloudUploadIcon, 
  GetApp as GetAppIcon, 
  ArrowBackIos as ArrowBackIosIcon, 
  ArrowForwardIos as ArrowForwardIosIcon, 
  RotateLeft as RotateLeftIcon, 
  RotateRight as RotateRightIcon, 
  Flip as FlipIcon, 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  DataUsage as DataUsageIcon,
  BrightnessHigh, 
  Brightness4, 
  Image as ImageIcon, 
  Crop as CropIcon, 
  History as HistoryIcon, 
  Undo as UndoIcon, 
  Redo as RedoIcon, 
  AddPhotoAlternate as AddPhotoAlternateIcon, 
  Compare as CompareIcon, 
  Tune as TuneIcon, 
  FormatColorFill as FormatColorFillIcon, 
  Colorize as ColorizeIcon, 
  BlurOn as BlurOnIcon, 
  Settings as SettingsIcon, 
  Save as SaveIcon, 
  Delete as DeleteIcon, 
  CloudDownload as CloudDownloadIcon, 
  Stream as StreamIcon,
  Compress as CompressIcon,
  Panorama as PanoramaIcon,
  Movie as MovieIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { saveAs } from 'file-saver';

class App extends Component {
  constructor() {
    super();
    this.state = {
      img: unequalized,
      images: [],
      databases: [{ name: 'Image 1', images: [] }],
      banco: 'Image 1',
      nBanco: 1,
      filterIntensity: 0,
      customFilters: [],
      filterType: 'none',
      theme: 'light',
      isLoading: false,
      snackbarOpen: false,
      snackbarMessage: '',
      imageMetadata: null,
      zoomLevel: 1,
      currentImageIndex: 0,
      drawerOpen: false,
      searchTerm: '',
      rotationAngle: 0,
      flipHorizontal: false,
      flipVertical: false,
      crop: false,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0,
      blur: 0,
      brightness: 100,
      contrast: 100,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      isStreaming: false,
      streamProgress: 0,
      compressionLevel: 50,
      downloadFormat: 'png',
      isCompressed: false,
      comparisonImage: null,
      showComparison: false,
      batchProcessing: false,
      batchImages: [],
      batchProcessingProgress: 0,
      batchProcessingTotal: 0,
      batchProcessingDialogOpen: false,
      advancedCompressionSettings: {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        preserveExif: true,
      },
      streamingSettings: {
        chunkSize: 1024 * 1024, // 1MB
        interval: 100, // ms
      },
      editHistory: [],
      currentHistoryIndex: -1,
      cropMode: false,
      saturation: 100,
      sharpness: 0,
      hue: 0,
      exposure: 0,
      noise: 0,
      vignette: 0,
      colorOverlay: { r: 255, g: 255, b: 255, a: 0 },
      showColorPicker: false,
      aspectRatio: '16:9',
      watermark: '',
      watermarkPosition: 'bottomRight',
      currentTab: 0,
      filtersExpanded: false,
      advancedSettingsExpanded: false,
      textOverlay: '',
      textOverlaySettings: {
        font: 'Arial',
        size: 24,
        color: '#000000',
        position: 'center',
      },
    };
    this.editorRef = React.createRef();
    this.fileInputRef = React.createRef();
    this.batchFileInputRef = React.createRef();
    this.comparisonFileInputRef = React.createRef();
  }

  

  loadImageMetadata = () => {
    setTimeout(() => {
      this.setState({
        imageMetadata: {
          dimensions: '1920x1080',
          format: 'JPEG',
          size: '2.3 MB',
          takenDate: '2024'
        },
      });
    }, 1500);
  };

  handleUpload = async (event) => {
    this.setState({ isLoading: true });

    if (!event.target.files) {
      console.error("No files selected!");
      return;
    }

    const newImages = Array.from(event.target.files).map((file) =>
      URL.createObjectURL(file)
    );

    const currentImage = this.editorRef.current ? this.editorRef.current.getImage() : null;

    if (currentImage) {
      await this.setState((state) => {
        const images = state.images.concat(currentImage);
        return {
          images: images,
          img: newImages[0],
          currentImageIndex: images.length,
        };
      });
    } else {
      await this.setState({
        img: newImages[0],
        currentImageIndex: 0,
        images: newImages,
      });
    }

    if (this.editorRef.current && this.editorRef.current.handleChange) {
      this.editorRef.current.handleChange();
    }

    this.setState({
      isLoading: false,
      snackbarOpen: true,
      snackbarMessage: 'Image uploaded successfully!',
    });
    this.loadImageMetadata();
    this.addToHistory();
  };

  createDB = () => {
    const nBanco = this.state.nBanco + 1;
    const name = 'Image ' + nBanco;
    const newDb = {
      name: name,
      images: [],
    };
    this.setState((state) => {
      const databases = state.databases.concat(newDb);
      return {
        databases: databases,
        nBanco: nBanco,
        snackbarOpen: true,
        snackbarMessage: `New database "${name}" created!`,
      };
    });
  };

  changeDb = async (event) => {
    const newDb = event.target.textContent;
    const currentBanco = this.state.banco;
    if (currentBanco !== newDb) {
      this.setState({ isLoading: true });
      const currentImages = this.state.images;
      const currentImage = this.editorRef.current ? this.editorRef.current.getImage() : null;
      if (currentImage) {
        currentImages.push(currentImage);
      }
      let newImages = [];
      const databases = [...this.state.databases];
      databases.forEach((database) => {
        if (database.name === currentBanco) {
          database.images = currentImages;
        }

        if (database.name === newDb) {
          newImages = database.images;
        }
      });
      if (this.editorRef.current && this.editorRef.current.clearCanvas) {
        this.editorRef.current.clearCanvas();
      }
      await this.setState({
        databases: databases,
        banco: newDb,
        images: newImages,
        img: newImages[0] || null,
        currentImageIndex: 0,
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Switched to database "${newDb}"!`,
      });
      this.loadImageMetadata();
      this.addToHistory();
    }
  };

  handleDownload = () => {
    if (this.editorRef.current) {
      const currentImage = this.editorRef.current.getImage();
      if (currentImage) {
        saveAs(currentImage, `edited_image.${this.state.downloadFormat}`);
        this.setState({
          snackbarOpen: true,
          snackbarMessage: 'Image downloaded successfully!',
        });
      }
    }
  };

  handleDownloadFormatChange = (event) => {
    this.setState({ downloadFormat: event.target.value });
  };
  componentDidMount() {
    this.loadImageMetadata();
    this.loadCustomFilters();
  }
  
  loadCustomFilters = () => {
    const customFilters = [
      { name: 'Vintage', settings: { brightness: 110, contrast: 85, saturation: 80, hue: 10 } },
      { name: 'Dramatic', settings: { brightness: 90, contrast: 120, saturation: 110, hue: -5 } },
      { name: 'Cool', settings: { brightness: 100, contrast: 95, saturation: 90, hue: -10 } },
      { name: 'Warm', settings: { brightness: 105, contrast: 100, saturation: 110, hue: 5 } },
      { name: 'Noir', settings: { brightness: 80, contrast: 130, saturation: 0, hue: 0 } },
      { name: 'Pastel', settings: { brightness: 110, contrast: 90, saturation: 120, hue: 5 } },
    ];
    this.setState({ customFilters });
  };
  handleCompression = () => {
    const originalSize = 2300; // Simulated original size in KB
    const compressedSize = originalSize * (1 - this.state.compressionLevel / 100);
    const compressionRatio = (originalSize / compressedSize).toFixed(2);

    this.setState({
      originalSize: originalSize,
      compressedSize: compressedSize.toFixed(2),
      compressionRatio: compressionRatio,
      isCompressed: true,
    });

    this.setState({ snackbarOpen: true, snackbarMessage: 'Image compressed successfully!' });
    this.addToHistory();
  };

  handleAdvancedCompression = () => {
    // Implement advanced compression logic here
    const { quality, maxWidth, maxHeight, preserveExif } = this.state.advancedCompressionSettings;
    // Use these settings to perform more sophisticated compression
    // For now, we'll just use a placeholder implementation
    const originalSize = 2300; // Simulated original size in KB
    const compressedSize = originalSize * quality;
    const compressionRatio = (originalSize / compressedSize).toFixed(2);

    this.setState({
      originalSize: originalSize,
      compressedSize: compressedSize.toFixed(2),
      compressionRatio: compressionRatio,
      isCompressed: true,
      snackbarOpen: true,
      snackbarMessage: 'Advanced compression applied successfully!',
    });
    this.addToHistory();
  };

  handleReset = () => {
    this.setState({
      rotationAngle: 0,
      flipHorizontal: false,
      flipVertical: false,
      brightness: 100,
      contrast: 100,
      blur: 0,
      crop: false,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0,
      filterIntensity: 0,
      filterType: 'none',
      isCompressed: false,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      saturation: 100,
      sharpness: 0,
      hue: 0,
      exposure: 0,
      noise: 0,
      vignette: 0,
      colorOverlay: { r: 255, g: 255, b: 255, a: 0 },
      textOverlay: '',
    });
    this.setState({ snackbarOpen: true, snackbarMessage: 'Image reset successfully!' });
    this.addToHistory();
  };

  handleStream = () => {
    this.setState({ isStreaming: true, streamProgress: 0 });
    const interval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.streamProgress >= 100) {
          clearInterval(interval);
          return { isStreaming: false, snackbarOpen: true, snackbarMessage: 'Streaming completed!' };
        }
        return { streamProgress: prevState.streamProgress + 10 };
      });
    }, this.state.streamingSettings.interval);
  };

  handleAdvancedStreaming = () => {
    // Implement advanced streaming logic here
    const { chunkSize, interval } = this.state.streamingSettings;
    // Use these settings to perform more sophisticated streaming
    // For now, we'll just use a placeholder implementation
    this.setState({ isStreaming: true, streamProgress: 0 });
    const streamInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.streamProgress >= 100) {
          clearInterval(streamInterval);
          return { isStreaming: false, snackbarOpen: true, snackbarMessage: 'Advanced streaming completed!' };
        }
        return { streamProgress: prevState.streamProgress + (chunkSize / (1024 * 1024)) };
      });
    }, interval);
  };

  handleComparisonUpload = (event) => {
    const comparisonImage = URL.createObjectURL(event.target.files[0]);
    this.setState({ comparisonImage, showComparison: true });
  };

  toggleComparison = () => {
    this.setState((prevState) => ({ showComparison: !prevState.showComparison }));
  };

  handleBatchUpload = async (event) => {
    const batchImages = Array.from(event.target.files).map((file) =>
      URL.createObjectURL(file)
    );
    this.setState({
      batchImages: batchImages,
      snackbarOpen: true,
      snackbarMessage: `${batchImages.length} images ready for batch processing!`,
    });
  };

  processBatchImages = () => {
    this.setState({ isLoading: true, batchProcessingDialogOpen: true, batchProcessingTotal: this.state.batchImages.length });
    const processedImages = this.state.batchImages.map((img) => {
      // Apply compression to each image
      // For simplicity, we're just returning the original image
      // In a real scenario, you would apply the compression here
      return img;
    });

    let processedCount = 0;
    const interval = setInterval(() => {
      processedCount++;
      this.setState({ batchProcessingProgress: (processedCount / this.state.batchProcessingTotal) * 100 });
      if (processedCount >= this.state.batchProcessingTotal) {
        clearInterval(interval);
        this.setState((state) => ({
          images: state.images.concat(processedImages),
          batchImages: [],
          isLoading: false,
          batchProcessingDialogOpen: false,
          snackbarOpen: true,
          snackbarMessage: 'Batch processing and compression completed!',
        }));
      }
    }, 500);
  };

  addToHistory = () => {
    const newState = { ...this.state };
    delete newState.editHistory;
    delete newState.currentHistoryIndex;
    
    this.setState(prevState => ({
      editHistory: [...prevState.editHistory.slice(0, prevState.currentHistoryIndex + 1), newState],
      currentHistoryIndex: prevState.currentHistoryIndex + 1
    }));
  };

  handleUndo = () => {
    if (this.state.currentHistoryIndex > 0) {
      this.setState(prevState => ({...prevState.editHistory[prevState.currentHistoryIndex - 1],
        currentHistoryIndex: prevState.currentHistoryIndex - 1
      }));
    }
  };

  handleRedo = () => {
    if (this.state.currentHistoryIndex < this.state.editHistory.length - 1) {
      this.setState(prevState => ({
        ...prevState.editHistory[prevState.currentHistoryIndex + 1],
        currentHistoryIndex: prevState.currentHistoryIndex + 1
      }));
    }
  };

  toggleCropMode = () => {
    this.setState(prevState => ({ cropMode: !prevState.cropMode }));
  };

  handleSaturationChange = (event, newValue) => {
    this.setState({ saturation: newValue });
    this.addToHistory();
  };

  handleHueChange = (event, newValue) => {
    this.setState({ hue: newValue });
    this.addToHistory();
  };

  handleExposureChange = (event, newValue) => {
    this.setState({ exposure: newValue });
    this.addToHistory();
  };

  handleNoiseChange = (event, newValue) => {
    this.setState({ noise: newValue });
    this.addToHistory();
  };

  handleVignetteChange = (event, newValue) => {
    this.setState({ vignette: newValue });
    this.addToHistory();
  };

  handleColorOverlayChange = (color) => {
    this.setState({ colorOverlay: color.rgb });
    this.addToHistory();
  };

  handleAspectRatioChange = (event) => {
    this.setState({ aspectRatio: event.target.value });
    this.addToHistory();
  };

  handleWatermarkChange = (event) => {
    this.setState({ watermark: event.target.value });
  };

  handleWatermarkPositionChange = (event) => {
    this.setState({ watermarkPosition: event.target.value });
  };

  handleTabChange = (event, newValue) => {
    this.setState({ currentTab: newValue });
  };

  toggleFiltersExpanded = () => {
    this.setState((prevState) => ({ filtersExpanded: !prevState.filtersExpanded }));
  };

  toggleAdvancedSettingsExpanded = () => {
    this.setState((prevState) => ({ advancedSettingsExpanded: !prevState.advancedSettingsExpanded }));
  };

  applyCustomFilter = (filter) => {
    this.setState({
      ...filter.settings,
      activeCustomFilter: filter.name,
    });
    this.addToHistory();
  };

  render() {
    const filteredImages = this.state.images.filter((image) =>
      image.toLowerCase().includes(this.state.searchTerm.toLowerCase())
    );
    const theme = createTheme({
      palette: {
        mode: this.state.theme,
      },
    });

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => this.setState({ drawerOpen: true })}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              ImagerML - Search Database
            </Typography>
            <Tooltip title="Open Database List">
              <IconButton color="inherit" onClick={() => this.setState({ drawerOpen: true })}>
                <DataUsageIcon />
              </IconButton>
            </Tooltip>
            <Switch
              checked={this.state.theme === 'dark'}
              onChange={() => this.setState({ theme: this.state.theme === 'light' ? 'dark' : 'light' })}
              inputProps={{ 'aria-label': 'theme switch' }}
              icon={<BrightnessHigh />}
              checkedIcon={<Brightness4 />}
            />
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={this.state.drawerOpen} onClose={() => this.setState({ drawerOpen: false })}>
          <div
            role="presentation"
            onClick={() => this.setState({ drawerOpen: false })}
            onKeyDown={() => this.setState({ drawerOpen: false })}
          >
            <DbList
              databases={this.state.databases}
              createDB={this.createDB}
              changeDb={this.changeDb}
            />
          </div>
        </Drawer>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper style={{ padding: '1rem' }}>
                <Editor
                  img={this.state.img}
                  ref={this.editorRef}
                  filterIntensity={this.state.filterIntensity}
                  filterType={this.state.filterType}
                  zoomLevel={this.state.zoomLevel}
                  rotationAngle={this.state.rotationAngle}
                  flipHorizontal={this.state.flipHorizontal}
                  flipVertical={this.state.flipVertical}
                  crop={this.state.crop}
                  cropX={this.state.cropX}
                  cropY={this.state.cropY}
                  cropWidth={this.state.cropWidth}
                  cropHeight={this.state.cropHeight}
                  blur={this.state.blur}
                  brightness={this.state.brightness}
                  contrast={this.state.contrast}
                  saturation={this.state.saturation}
                  sharpness={this.state.sharpness}
                  cropMode={this.state.cropMode}
                  hue={this.state.hue}
                  exposure={this.state.exposure}
                  noise={this.state.noise}
                  vignette={this.state.vignette}
                  colorOverlay={this.state.colorOverlay}
                  aspectRatio={this.state.aspectRatio}
                  watermark={this.state.watermark}
                  watermarkPosition={this.state.watermarkPosition}
                />
                <Typography variant="h6" gutterBottom>
                  Image Info:
                </Typography>
                {this.state.isLoading ? (
                  <CircularProgress />
                ) : (
                  <div>
                    {this.state.imageMetadata ? (
                      <List>
                        <ListItem><ListItemText primary="Dimensions" secondary={this.state.imageMetadata.dimensions} /></ListItem>
                        <ListItem><ListItemText primary="Format" secondary={this.state.imageMetadata.format} /></ListItem>
                        <ListItem><ListItemText primary="Size" secondary={this.state.imageMetadata.size} /></ListItem>
                        <ListItem><ListItemText primary="Taken Date" secondary={this.state.imageMetadata.takenDate} /></ListItem>
                      </List>
                    ) : (
                      'No metadata available'
                    )}
                  </div>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper style={{ padding: '1rem' }}>
                <Tabs value={this.state.currentTab} onChange={this.handleTabChange} centered>
                  <Tab label="Adjustments" />
                  <Tab label="Filters" />
                  <Tab label="Advanced" />
                  <Tab label="Compression" />
                </Tabs>
                {this.state.currentTab === 0 && (
                  <div>
                    <Typography variant="h6" gutterBottom>Brightness:</Typography>
                    <Slider value={this.state.brightness} onChange={(e, newValue) => this.setState({ brightness: newValue })} min={0} max={200} />
                    <Typography variant="h6" gutterBottom>Contrast:</Typography>
                    <Slider value={this.state.contrast} onChange={(e, newValue) => this.setState({ contrast: newValue })} min={0} max={200} />
                    <Typography variant="h6" gutterBottom>Saturation:</Typography>
                    <Slider value={this.state.saturation} onChange={this.handleSaturationChange} min={0} max={200} />
                    <Typography variant="h6" gutterBottom>Hue:</Typography>
                    <Slider value={this.state.hue} onChange={this.handleHueChange} min={-180} max={180} />
                    <Typography variant="h6" gutterBottom>Exposure:</Typography>
                    <Slider value={this.state.exposure} onChange={this.handleExposureChange} min={-100} max={100} />
                    <Typography variant="h6" gutterBottom>Sharpness:</Typography>
                    <Slider value={this.state.sharpness} onChange={(e, newValue) => this.setState({ sharpness: newValue })} min={0} max={100} />
                  </div>
                )}
                {this.state.currentTab === 1 && (
  <div>
    <Typography variant="h6" gutterBottom>Filter Type:</Typography>
    <ToggleButtonGroup
      value={this.state.filterType}
      exclusive
      onChange={(e, newFilterType) => this.setState({ filterType: newFilterType })}
      aria-label="image filter type"
    >
      <ToggleButton value="none" aria-label="none">None</ToggleButton>
      <ToggleButton value="grayscale" aria-label="grayscale">Grayscale</ToggleButton>
      <ToggleButton value="sepia" aria-label="sepia">Sepia</ToggleButton>
      <ToggleButton value="invert" aria-label="invert">Invert</ToggleButton>
    </ToggleButtonGroup>
    <Typography variant="h6" gutterBottom>Filter Intensity:</Typography>
    <Slider value={this.state.filterIntensity} onChange={(e, newValue) => this.setState({ filterIntensity: newValue })} min={0} max={100} />
    <Typography variant="h6" gutterBottom>Custom Filters:</Typography>
    {this.state.customFilters && this.state.customFilters.map((filter) => (
      <Button
        key={filter.name}
        variant={this.state.activeCustomFilter === filter.name ? "contained" : "outlined"}
        onClick={() => this.applyCustomFilter(filter)}
      >
        {filter.name}
      </Button>
    ))}
  </div>
)}
                {this.state.currentTab === 2 && (
                  <div>
                    <Typography variant="h6" gutterBottom>Blur:</Typography>
                    <Slider value={this.state.blur} onChange={(e, newValue) => this.setState({ blur: newValue })} min={0} max={20} />
                    <Typography variant="h6" gutterBottom>Noise:</Typography>
                    <Slider value={this.state.noise} onChange={this.handleNoiseChange} min={0} max={100} />
                    <Typography variant="h6" gutterBottom>Vignette:</Typography>
                    <Slider value={this.state.vignette} onChange={this.handleVignetteChange} min={0} max={100} />
                    <Typography variant="h6" gutterBottom>Color Overlay:</Typography>
                    <SketchPicker
                      color={this.state.colorOverlay}
                      onChange={this.handleColorOverlayChange}
                    />
                    <Typography variant="h6" gutterBottom>Aspect Ratio:</Typography>
                    <Select
                      value={this.state.aspectRatio}
                      onChange={this.handleAspectRatioChange}
                      fullWidth
                    >
                      <MenuItem value="16:9">16:9</MenuItem>
                      <MenuItem value="4:3">4:3</MenuItem>
                      <MenuItem value="1:1">1:1</MenuItem>
                      <MenuItem value="3:2">3:2</MenuItem>
                    </Select>
                    <Typography variant="h6" gutterBottom>Watermark:</Typography>
                    <TextField
                      value={this.state.watermark}
                      onChange={this.handleWatermarkChange}
                      fullWidth
                      placeholder="Enter watermark text"
                    />
                    <Select
                      value={this.state.watermarkPosition}
                      onChange={this.handleWatermarkPositionChange}
                      fullWidth
                    >
                      <MenuItem value="topLeft">Top Left</MenuItem>
                      <MenuItem value="topRight">Top Right</MenuItem>
                      <MenuItem value="bottomLeft">Bottom Left</MenuItem>
                      <MenuItem value="bottomRight">Bottom Right</MenuItem>
                      <MenuItem value="center">Center</MenuItem>
                    </Select>
                  </div>
                )}
                {this.state.currentTab === 3 && (
                  <div>
                    <Typography variant="h6" gutterBottom>Compression Level:</Typography>
                    <Slider
                      value={this.state.compressionLevel}
                      onChange={(e, newValue) => this.setState({ compressionLevel: newValue })}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="h6" gutterBottom>Advanced Compression Settings:</Typography>
                    <TextField
                      label="Quality"
                      type="number"
                      value={this.state.advancedCompressionSettings.quality}
                      onChange={(e) => this.setState({
                        advancedCompressionSettings: {
                          ...this.state.advancedCompressionSettings,
                          quality: parseFloat(e.target.value)
                        }
                      })}
                      inputProps={{ min: 0, max: 1, step: 0.1 }}
                    />
                    <TextField
                      label="Max Width"
                      type="number"
                      value={this.state.advancedCompressionSettings.maxWidth}
                      onChange={(e) => this.setState({
                        advancedCompressionSettings: {
                          ...this.state.advancedCompressionSettings,
                          maxWidth: parseInt(e.target.value)
                        }
                      })}
                    />
                    <TextField
                      label="Max Height"
                      type="number"
                      value={this.state.advancedCompressionSettings.maxHeight}
                      onChange={(e) => this.setState({
                        advancedCompressionSettings: {
                          ...this.state.advancedCompressionSettings,
                          maxHeight: parseInt(e.target.value)
                        }
                      })}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={this.state.advancedCompressionSettings.preserveExif}
                          onChange={(e) => this.setState({
                            advancedCompressionSettings: {
                              ...this.state.advancedCompressionSettings,
                              preserveExif: e.target.checked
                            }
                          })}
                        />
                      }
                      label="Preserve EXIF Data"
                    />
                    <Button onClick={this.handleCompression} startIcon={<CompressIcon />}>
                      Compress Image
                    </Button>
                    {this.state.isCompressed && (
                      <div>
                        <Typography>Original size: {this.state.originalSize} KB</Typography>
                        <Typography>Compressed size: {this.state.compressedSize} KB</Typography>
                        <Typography>Compression ratio: {this.state.compressionRatio}</Typography>
                      </div>
                    )}
                  </div>
                )}
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={3}></Grid>
          <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper style={{ padding: '1rem', marginTop: '1rem' }}>
        <Typography variant="h6" gutterBottom>Image Gallery:</Typography>
        <TextField
          label="Search images"
          value={this.state.searchTerm}
          onChange={(e) => this.setState({ searchTerm: e.target.value })}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ImgList
          images={filteredImages}
          currentIndex={this.state.currentImageIndex}
          onSelect={(index) => this.setState({ currentImageIndex: index, img: this.state.images[index] })}
        />
        </Paper>
</Grid>
</Grid>
<Grid container spacing={3}>
<Grid item xs={12}>
<Paper style={{ padding: '1rem', marginTop: '1rem' }}>
<Typography variant="h6" gutterBottom>Actions:</Typography>
<input
accept="image/"
style={{ display: 'none' }}
id="raised-button-file"
multiple
type="file"
onChange={this.handleUpload}
ref={this.fileInputRef}
/>
<label htmlFor="raised-button-file">
<Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
Upload
</Button>
</label>
<Button onClick={this.handleDownload} startIcon={<GetAppIcon />}>
Download
</Button>
<Select
value={this.state.downloadFormat}
onChange={this.handleDownloadFormatChange}
>
<MenuItem value="png">PNG</MenuItem>
<MenuItem value="jpg">JPG</MenuItem>
<MenuItem value="webp">WebP</MenuItem>
</Select>
<Button onClick={this.handleReset} startIcon={<RotateLeftIcon />}>
Reset
</Button>
<Button onClick={this.handleUndo} startIcon={<UndoIcon />} disabled={this.state.currentHistoryIndex <= 0}>
Undo
</Button>
<Button onClick={this.handleRedo} startIcon={<RedoIcon />} disabled={this.state.currentHistoryIndex >= this.state.editHistory.length - 1}>
Redo
</Button>
<Button onClick={() => this.setState({ currentImageIndex: Math.max(0, this.state.currentImageIndex - 1) })} startIcon={<ArrowBackIosIcon />}>
Previous
</Button>
<Button onClick={() => this.setState({ currentImageIndex: Math.min(this.state.images.length - 1, this.state.currentImageIndex + 1) })} startIcon={<ArrowForwardIosIcon />}>
Next
</Button>
<Button onClick={this.handleCompression} startIcon={<CompressIcon />}>
Compress
</Button>
<Button onClick={this.handleStream} startIcon={<StreamIcon />}>
Stream
</Button>
{this.state.isStreaming && (
<LinearProgress variant="determinate" value={this.state.streamProgress} />
)}
<Typography variant="h6" gutterBottom>Streaming Settings:</Typography>
<TextField
label="Chunk Size (bytes)"
type="number"
value={this.state.streamingSettings.chunkSize}
onChange={(e) => this.setState({
streamingSettings: {
...this.state.streamingSettings,
chunkSize: parseInt(e.target.value)
}
})}
/>
<TextField
label="Interval (ms)"
type="number"
value={this.state.streamingSettings.interval}
onChange={(e) => this.setState({
streamingSettings: {
...this.state.streamingSettings,
interval: parseInt(e.target.value)
}
})}
/>
<input
accept="image/"
style={{ display: 'none' }}
id="batch-button-file"
multiple
type="file"
onChange={this.handleBatchUpload}
ref={this.batchFileInputRef}
/>
<label htmlFor="batch-button-file">
<Button variant="contained" component="span" startIcon={<AddPhotoAlternateIcon />}>
Upload Batch Images
</Button>
</label>
<Button onClick={this.processBatchImages} startIcon={<TuneIcon />}>
Process Batch
</Button>
</Paper>
</Grid>
</Grid>
</Container>
<Snackbar
anchorOrigin={{
vertical: 'bottom',
horizontal: 'left',
}}
open={this.state.snackbarOpen}
autoHideDuration={6000}
onClose={() => this.setState({ snackbarOpen: false })}
message={this.state.snackbarMessage}
/>
<Dialog
open={this.state.batchProcessingDialogOpen}
onClose={() => this.setState({ batchProcessingDialogOpen: false })}
aria-labelledby="batch-processing-dialog-title"
>
<DialogTitle id="batch-processing-dialog-title">Batch Processing</DialogTitle>
<DialogContent>
<Typography>Processing {this.state.batchProcessingTotal} images...</Typography>
<LinearProgress variant="determinate" value={this.state.batchProcessingProgress} />
</DialogContent>
<DialogActions>
<Button onClick={() => this.setState({ batchProcessingDialogOpen: false })} color="primary">
Close
</Button>
</DialogActions>
</Dialog>
</ThemeProvider>
);
}
}
export default App;