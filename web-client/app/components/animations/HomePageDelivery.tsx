import Lottie from "lottie-react";
import HomePageDelivery from "@/public/animations/Delivery.json";

export default function HomePageDeliveryAnimation(){

  return (
    <div className="w-full h-full">
      <Lottie animationData={HomePageDelivery} loop />
    </div>
  )
};
