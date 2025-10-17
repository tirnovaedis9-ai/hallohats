
import React, { useState } from 'react';

import { Modal, Button, Container, Row, Col, Alert, InputGroup, FormControl } from 'react-bootstrap';

import { useTranslation } from 'react-i18next';

import { FaStar, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

import './ShopModal.css';

import shopImage1 from '../assets/images/Shop (1).png';

import shopImage2 from '../assets/images/Shop (2).png';

import shopImage3 from '../assets/images/Shop (3).png';



const images = [shopImage1, shopImage2, shopImage3];



const ShopModal = ({ show, onHide, theme }) => {

  const { t } = useTranslation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);



  const handleNextImage = () => {

    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);

  };



  const handlePrevImage = () => {

    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

  };



  const handleThumbnailClick = (index) => {

    setCurrentImageIndex(index);

  };



  const handleQuantityChange = (type) => {

    if (type === 'increase') {

      setQuantity(prevQuantity => prevQuantity + 1);

    } else if (type === 'decrease' && quantity > 1) {

      setQuantity(prevQuantity => prevQuantity - 1);

    }

  };



  const toggleCartModal = () => {

    setIsCartModalOpen(!isCartModalOpen);

  };



  const renderStars = (rating) => {

    return Array.from({ length: 5 }, (_, index) => (

      <FaStar key={index} color={index < rating ? '#ffc107' : '#e4e5e9'} />

    ));

  };



  return (

    <>

      <Modal show={show} onHide={onHide} centered size="lg" className={`shop-modal ${theme}-theme`}>

        <Modal.Header closeButton>

        </Modal.Header>

        <Modal.Body>

          <Button variant="light" onClick={toggleCartModal} className="cart-button">

            <FaShoppingCart />

          </Button>

          <Container>

            <Row>

              <Col md={6} className="text-center mb-4 mb-md-0">

                <div className="product-image-container">

                  <Button variant="outline-secondary" onClick={handlePrevImage} className="carousel-arrow prev">&lt;</Button>

                  <img src={images[currentImageIndex]} alt={`${t('shop.product_name')} ${currentImageIndex + 1}`} className="product-image" />

                  <Button variant="outline-secondary" onClick={handleNextImage} className="carousel-arrow next">&gt;</Button>

                </div>

                <div className="thumbnail-container">

                  {images.map((img, index) => (

                    <img

                      key={index}

                      src={img}

                      alt={`Thumbnail ${index + 1}`}

                      className={`thumbnail-image ${index === currentImageIndex ? 'active' : ''}`}

                      onClick={() => handleThumbnailClick(index)}

                    />

                  ))}

                </div>

                <Alert variant="danger" className="shipping-alert mt-3">

                  {t('shop.shipping_unavailable')}

                </Alert>

                            </Col>

                            <Col md={6} className="product-details-col">

                              <h2>{t('shop.product_name')}</h2>

                <p className="product-price">$99.00</p>

                <p className="product-description">{t('shop.product_description')}</p>



                <div className="d-flex align-items-center mb-3">

                  <span className="me-2">{t('shop.quantity')}:</span>

                  <InputGroup className="quantity-input-group">

                    <Button variant="outline-secondary" onClick={() => handleQuantityChange('decrease')}>

                      <FaMinus />

                    </Button>

                    <FormControl

                      aria-label="Product quantity"

                      value={quantity}

                      readOnly

                      className="text-center"

                    />

                    <Button variant="outline-secondary" onClick={() => handleQuantityChange('increase')}>

                      <FaPlus />

                    </Button>

                  </InputGroup>

                </div>

                <div className="d-grid gap-2 mt-3">

                  <Button variant="primary" disabled>

                    {t('shop.add_to_cart')}

                  </Button>

                  <Button variant="success" disabled>

                    {t('shop.buy_now')}

                  </Button>

                </div>

              </Col>

            </Row>

          <Row className="mt-4">

            <Col>

              <h4 className="reviews-title">{t('shop.reviews_title')}</h4>

              <div className="review">

                <div className="review-header">

                  <strong>Liam Johnson</strong>

                  <div className="stars">{renderStars(5)}</div>

                </div>

                <p>"{t('shop.review1_text')}"</p>

              </div>

              <div className="review">
                <div className="review-header">
                  <strong>Olivia Davis</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review2_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Noah Taylor</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review3_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Emma Brown</strong>
                  <div className="stars">{renderStars(4)}</div>
                </div>
                <p>"{t('shop.review4_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>James Wilson</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review5_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Sophia Miller</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review6_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>William Garcia</strong>
                  <div className="stars">{renderStars(4)}</div>
                </div>
                <p>"{t('shop.review7_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Isabella Martinez</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review8_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Mason Rodriguez</strong>
                  <div className="stars">{renderStars(5)}</div>
                </div>
                <p>"{t('shop.review9_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Ava Jones</strong>
                  <div className="stars">{renderStars(4)}</div>
                </div>
                <p>"{t('shop.review10_text')}"</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <strong>Ege</strong>
                  <div className="stars">{renderStars(2)}</div>
                </div>
                <p>"{t('shop.review11_text')}"</p>
              </div>

            </Col>

          </Row>

        </Container>

      </Modal.Body>

    </Modal>



      <Modal show={isCartModalOpen} onHide={toggleCartModal} centered className={`shop-modal ${theme}-theme`}>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="cart-modal-icon">!</div>
        </Modal.Body>
      </Modal>
    </>

  );

};



export default ShopModal;
