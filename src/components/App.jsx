import { useState, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { Wrapper } from './App.styled';
import { GlobalStyle } from './GlobalStyle';
import { fetchImages } from 'services/image-api';
import { Searchbar } from './Searchbar';
import { Notification } from './Notification';
import { ImageGallery } from './ImageGallery';
import { Modal } from './Modal';
import { Button } from './Button';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
};

export function App() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [largeImage, setLargeImage] = useState('');
  const [status, setStatus] = useState(Status.IDLE);

  useEffect(() => {
    if (!query) {
      return;
    }
    setStatus(Status.PENDING);
    fetchImages({ query: query, page: page })
      .then(({ totalHits, hits }) => {
        if (totalHits) {
          setImages(prevImages => [...prevImages, ...hits]);
          setTotal(totalHits);
          setStatus(Status.RESOLVED);
        } else {
          setStatus(Status.REJECTED);
        }
      })
      .catch(error => {
        console.log(error);
        setStatus(Status.REJECTED);
      });
  }, [page, query]);

  const handleFormSubmit = e => {
    e.preventDefault();
    const searchQuery = e.target.elements.query.value.trim().toLowerCase();

    if (!searchQuery) {
      alert('Search box cannot be empty. Please enter the word.');
      return;
    }
    setQuery(searchQuery);
    setPage(1);
    setImages([]);

    e.target.reset();
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
    setStatus(Status.PENDING);
  };

  const openModal = image => {
    setLargeImage(image);
  };

  const closeModal = () => {
    setLargeImage('');
  };

  if (status === Status.IDLE) {
    return (
      <Wrapper>
        <GlobalStyle />
        <Searchbar onSubmit={handleFormSubmit} />
        <Notification message="There are no images yet." />
      </Wrapper>
    );
  }
  if (status === Status.PENDING) {
    return (
      <Wrapper>
        <GlobalStyle />
        <Searchbar onSubmit={handleFormSubmit} />
        <ImageGallery items={images} onClick={openModal} />
        <ThreeDots
          height="50"
          width="50"
          radius="9"
          color="#3f51b5"
          ariaLabel="three-dots-loading"
          wrapperStyle={{
            margin: '0 auto',
          }}
          visible={true}
        />
      </Wrapper>
    );
  }
  if (status === Status.REJECTED) {
    return (
      <Wrapper>
        <GlobalStyle />
        <Searchbar onSubmit={handleFormSubmit} />
        <Notification message={`No results containing ${query} were found.`} />
      </Wrapper>
    );
  }
  if (status === Status.RESOLVED) {
    return (
      <Wrapper>
        <GlobalStyle />
        <Searchbar onSubmit={handleFormSubmit} />
        <ImageGallery items={images} onClick={openModal} />
        {largeImage.length > 0 && (
          <Modal onClose={closeModal} image={largeImage} />
        )}
        {images.length < total && <Button onClick={loadMore} />}
      </Wrapper>
    );
  }
}
