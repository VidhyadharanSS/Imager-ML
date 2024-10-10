import React from 'react';
import { ImageList, ImageListItem, ImageListItemBar, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

const useStyles = styled((theme) => ({
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
}));

const ImgList = ({ images, currentImageIndex, changeImage }) => {
  const classes = useStyles();

  return (
    <Paper>
      <ImageList cols={2.5}>
        {images.map((image, index) => (
          <ImageListItem key={index} onClick={() => changeImage(index)}>
            <img className={classes.image} src={image} alt={`Thumbnail ${index + 1}`} />
            <ImageListItemBar
              title={`Image ${index + 1}`}
              classes={{
                root: classes.titleBar,
              }}
              actionIcon={
                <IconButton aria-label={`info about Image ${index + 1}`}>
                  <InfoIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Paper>
  );
};

export default ImgList;