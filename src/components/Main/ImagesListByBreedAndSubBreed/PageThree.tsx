import React, { useState, useEffect, useCallback } from "react";
import useFetch from "../../../utils/hooks/useFetch";
import styles from "./PageThree.module.css";
import Loader from "../../Loader/Loader";
import Error from "../../Error/Error";

interface PageThreeProps {
  content: React.ReactNode;
}

const PageThree: React.FC<PageThreeProps> = ({ content }) => {
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [selectedSubBreeds, setSelectedSubBreeds] = useState<string[]>([]);
  const [randomBreedImage, setRandomBreedImage] = useState<string>("");
  const [subBreedImages, setSubBreedImages] = useState<{
    [key: string]: string[];
  }>({});

  const { data: breedsData, fetchData: fetchBreeds } = useFetch(
    "https://dog.ceo/api/breeds/list/all"
  );

  const {
    data: randomBreedImageData,
    isLoading: randomImageLoading,
    error: randomImageError,
    fetchData: fetchRandomBreedImage,
  } = useFetch(
    selectedBreed
      ? `https://dog.ceo/api/breed/${selectedBreed}/images/random`
      : ""
  );

  const { data: subBreedsData, fetchData: fetchSubBreeds } = useFetch(
    selectedBreed ? `https://dog.ceo/api/breed/${selectedBreed}/list` : ""
  );

  const fetchSubBreedImages = useCallback(
    async (breed: string, subBreed: string) => {
      const res = await fetch(
        `https://dog.ceo/api/breed/${breed}/${subBreed}/images`
      );
      const data = await res.json();
      setSubBreedImages((prevImages) => ({
        ...prevImages,
        [subBreed]: data.message,
      }));
    },
    []
  );

  const handleRandomBreedClick = () => {
    if (!breedsData || Object.keys(breedsData.message).length === 0) return;

    // Select a random breed
    const breeds = Object.keys(breedsData.message);
    const randomIndex = Math.floor(Math.random() * breeds.length);
    const randomBreed = breeds[randomIndex];
    setSelectedBreed(randomBreed);

    // Fetch random image and sub-breeds for the selected breed
    fetchRandomBreedImage();
    fetchSubBreeds();
  };

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  useEffect(() => {
    if (randomBreedImageData) {
      setRandomBreedImage(randomBreedImageData.message as string);
    }
  }, [randomBreedImageData]);

  useEffect(() => {
    if (subBreedsData) {
      setSelectedSubBreeds(subBreedsData.message as string[]);
      if (subBreedsData.message.length > 0) {
        (subBreedsData.message as string[]).forEach((subBreed: string) => {
          fetchSubBreedImages(selectedBreed, subBreed);
        });
      }
    }
  }, [subBreedsData, selectedBreed, fetchSubBreedImages]);

  return (
    <div>
      <h1 className="heading">{content}</h1>
      <button
        className={styles["select-breed"]}
        onClick={handleRandomBreedClick}
      >
        Click here to select Random Breed
      </button>
      {selectedBreed && (
        <div className={styles.images}>
          <h2 id="random_image_title">
            Random Image of: <span>{selectedBreed} breed</span>
          </h2>
          <div className={styles["image-container"]}>
            {randomImageLoading ? (
              <Loader />
            ) : randomImageError ? (
              <Error error="Image not found" />
            ) : (
              <img
                id="random_image"
                src={randomBreedImage}
                alt={selectedBreed}
              />
            )}
          </div>
          {selectedSubBreeds.length > 0 && (
            <div>
              <h2>Sub-Breed Images</h2>
              <div className={styles["sub-breeds-container"]}>
                {selectedSubBreeds.map((subBreed) => {
                  const images = subBreedImages[subBreed] || [];
                  return (
                    <div className={styles["sub-breed"]} key={subBreed}>
                      <h3 className={styles["sub-breed-name"]}>{subBreed}</h3>
                      <div className={styles["sub-breed-images"]}>
                        {Array.isArray(images) &&
                          images.map((image, index) => (
                            <div
                              className={styles["sub-breed-image"]}
                              key={index}
                            >
                              <img
                                onLoad={() => {
                                  // Image loaded, remove the loading text
                                  const loadingText = document.getElementById(
                                    `loading_${index}`
                                  );
                                  if (loadingText) {
                                    loadingText.style.display = "none";
                                  }
                                }}
                                src={image}
                                alt={subBreed}
                              />
                              <p
                                id={`loading_${index}`}
                                style={{ color: "white", textAlign: "center" }}
                              >
                                Loading...
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  // );
};

export default PageThree;
