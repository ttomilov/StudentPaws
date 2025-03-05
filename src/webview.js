const images = {
    happy: "cat_happy.png",
    angry: "cat_angry.jpg",
    neutral: "cat_neutral.png",
    absent: "cat_absent.png",
    coding: "cat_coding.png",
    success: "cat_success.png",
    failed: "cat_failed.png"
};

window.addEventListener('message', event => {
    const state = event.data.state;
    const petImage = document.getElementById('pet-image');

    if (state === "absent") {
        petImage.style.display = "none";
    } else {
        petImage.style.display = "block";
        const imageName = images[state] || images.happy;
        petImage.src = `${window.assetsUri}/${imageName}`;
    }
});