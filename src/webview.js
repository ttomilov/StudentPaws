const images = {
    happy: "pet_happy.png",
    angry: "cat_angry.jpg",
    neutral: "cat_neutral.png",
    absent: "cat_absent.png",
    coding: "cat_coding.png",
    success: "cat_success.png"
};

window.addEventListener('message', event => {
    const state = event.data.state;
    const petImage = document.getElementById('pet-image');

    if (event.data.baseUri) {
        baseUri = event.data.baseUri;
        return;
    }

    if (state === "absent") {
        petImage.style.display = "none";
    } else {
        const imageName = images[state] || images.happy;
        petImage.src = `${window.assetsUri}/${imageName}`;
    }
});
