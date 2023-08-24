import { HomeContainer, Product } from "@/styles/pages/home";
import Image from "next/image";
import Stripe from "stripe";
import { stripe } from "../lib/stripe"
import { GetStaticProps } from "next";
import { useState } from "react";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import Head from "next/head";

export interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  }[]
}

export default function Home({ products }: HomeProps) {
  const [showArrowLeft, setShowArrowLeft] = useState(false);
  const [showArrowRight, setShowArrowRight] = useState(true);

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48
    },
    slideChanged(s: any) {
      setShowArrowLeft(s.animator.targetIdx != s.track.details.minIdx);
      setShowArrowRight(s.animator.targetIdx != s.track.details.maxIdx);
    }
  });

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>

      <HomeContainer ref={sliderRef} className="keen-slider">
        {showArrowLeft ?
          <button
            className="buttonLeft"
            onClick={() => instanceRef.current?.prev()}
          >
            <CaretLeft size={42} weight="bold" />
          </button> : null}

        {products.map(product => {
          return (
            <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
              <Product key={product.id} className="keen-slider__slide">
                <Image src={product.imageUrl} width={520} height={480} alt="" />

                <footer>
                  <strong>{product.name}</strong>
                  <span>R$ {product.price}</span>
                </footer>
              </Product>
            </Link>
          )
        })}

        {showArrowRight ?
          <button
            className="buttonRight"
            onClick={() => instanceRef.current?.next()}
          >
            <CaretRight size={42} weight="bold" />
          </button> : null}
      </HomeContainer >
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ["data.default_price"]
  });

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(price.unit_amount) / 100)
    }
  })

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2
  }
}
