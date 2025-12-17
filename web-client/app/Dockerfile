# Use the official Node.js image as the base image
FROM node:20

# Build-time args (Next.js inlines NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

# Make them available during build AND runtime
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npm run build

# Next.js defaults to 3000 unless you set PORT
EXPOSE 3000
CMD ["npm", "start"]