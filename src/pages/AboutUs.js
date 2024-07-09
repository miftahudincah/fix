import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} className="text-center">
          <h2>Tentang Kami</h2>
          <p>
            CV Haka Jaya adalah produsen alat peraga pendidikan yang berbasis di Surabaya. Kami 
            mengkhususkan diri dalam penyediaan berbagai modul pelatihan untuk SMK dan institusi 
            pendidikan teknik lainnya. Dengan fokus pada kualitas dan harga yang terjangkau, 
            kami menyediakan berbagai peralatan seperti modul hidrolik, modul kelistrikan, 
            dan workstation elektronik.
          </p>
          <p>
            Lokasi kami terletak di:
          </p>
          <ul className="list-unstyled">
            <li>Kantor: Jl. Dukuh Bulu No. 105, Lontar-Sambikerep, Surabaya</li>
            <li>Workshop: Jl. Kuwukan Garuda No.09B, Surabaya</li>
          </ul>
          <p>
            Untuk informasi lebih lanjut dan pemesanan, Anda dapat menghubungi kami di:
          </p>
          <ul className="list-unstyled">
            <li>Telepon/WhatsApp: 081217467156</li>
            <li>Email: <a href="mailto:cv.hakajaya@gmail.com">cv.hakajaya@gmail.com</a></li>
          </ul>
          <p>
            Kunjungi website kami di <a href="http://www.trainersmk.id" target="_blank" rel="noopener noreferrer">www.trainersmk.id</a> untuk melihat produk dan layanan lengkap kami.
          </p>
        </Col>
        <Col md={6} className="text-center">
          <Image 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiwQWud4tcyIKBjtzmYBXpQrYpe36G29YLZ7d6tUsKX9OksP4bp98JIWSH_1UmxR4Zo43a9dcdWFrkredPHptwF4SxISbnKv6m6RMSjWQR09O6Xv9qbcaDfYHtPZ8GrFxBOsoLBuow08EkX/s1600/header.png"
            rounded
            fluid
            alt="CV Haka Jaya"
          />
        </Col>
      </Row>
    </Container>
  );
}

export default AboutUs;
