$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 1,
      nav: true,
    },
    600: {
      items: 3,
      nav: false,
    },
    1000: {
      items: 4,
      nav: true,
      loop: false,
    },
  },
  lazyLoad: true,
});

// Get all elements with the lazyload class
var lazyload = document.querySelectorAll(".lazyload");

const options = {
  rootMargin: "0px",
  threshold: 0.5,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > 0) {
      entry.target.style.opacity = 1;
    }
  });
}, options);

lazyload.forEach((box) => {
  observer.observe(box);
});

document.addEventListener("DOMContentLoaded", function () {
  // Navbar functions
  var navContainer = document.getElementById("nav-container");
  var navMenu = document.getElementById("nav-menu");
  var toggle = document.getElementById("toggle");
  var infoContainer = document.getElementById("contact-info-container");
  var navComponent = document.querySelector(".nav-component");

  document.onclick = function (e) {
    if (
      e.target.id !== "toggle" &&
      e.target.id !== "nav-menu" &&
      e.target.id !== "navContainer"
    ) {
      toggle.classList.remove("active");
      navMenu.classList.remove("active");
      infoContainer.classList.remove("active");
      navContainer.classList.remove("active");
      if (navMenu.classList.contains("active")) {
        document.body.classList.add("overflow-y");
      } else {
        document.body.classList.remove("overflow-y");
      }
    }
  };
  toggle.onclick = function () {
    navContainer.classList.toggle("active");
    navMenu.classList.toggle("active");
    infoContainer.classList.toggle("active");
    toggle.classList.toggle("active");

    if (navContainer.classList.contains("active")) {
      document.body.classList.add("overflow-y");
    } else {
      document.body.classList.remove("overflow-y");
    }
  };

  const navbarHeight = navComponent.offsetHeight;
  const scrollOffset = 30;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > scrollOffset) {
      navContainer.classList.add("scrolled");
    } else {
      navContainer.classList.remove("scrolled");
    }

    if (window.pageYOffset > navbarHeight) {
      navComponent.classList.add("sticky");
    } else {
      navComponent.classList.remove("sticky");
    }
  });

  // Category Filter
  const categorySelect = document.querySelector("#category-select-item");
  const projectList = document.getElementById("project-list");

  if (categorySelect) {
    categorySelect.addEventListener("change", async (event) => {
      const category = event.target.value;

      const response = await fetch(`/projects?category=${category}`);

      try {
        const json = await response.json();

        // If the response is JSON, update the project list with the filtered projects
        let projectHtml = "";
        json.forEach((project) => {
          projectHtml += `
            <div class="list-item">
              <a href="/projects/${project.slug}" class="col-item-wrapper" style="background-image: url('../../projects_images/${project._id}/${project.image}');">
              <div class="project-icon-wrapper">
              <span
                class="iconify"
                data-icon="material-symbols:line-end-arrow-notch-rounded"
              ></span>
            </div>
              </a>
            </div>
          `;
        });
        projectList.innerHTML = projectHtml;
      } catch (err) {
        // If the response is HTML, update the entire page with the new HTML
        document.documentElement.innerHTML = await response.text();
      }
    });
  }

  // Filter Links
  const filterLinks = document.querySelectorAll(".category-select-item");

  filterLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault(); // prevent the default link behavior

      const category = link.getAttribute("href").split("=")[1];

      const response = await fetch(`/projects?category=${category}`);
      const projects = await response.json();

      // Update the DOM with the sorted projects

      // Get the project list element
      const projectList = document.getElementById("project-list");

      // Sort the projects based on category
      const sortedProjects = projects.sort((a, b) =>
        a.category > b.category ? 1 : -1
      );

      // Create a new HTML string with the sorted projects
      let projectHtml = "";
      sortedProjects.forEach((project) => {
        projectHtml += `
        <div class="list-item">
                    <a
                      href="/projects/${project.slug}"
                      class="col-item-wrapper"
                      style="
                        background-image: url('../../projects_images/${project._id}/${project.image}');
                      "
                    >
                    <div class="project-icon-wrapper">
                    <span
                      class="iconify"
                      data-icon="material-symbols:line-end-arrow-notch-rounded"
                    ></span>
                  </div>
                    </a>
                  </div>
      `;
      });
      // Update the project list element with the sorted project HTML
      projectList.innerHTML = projectHtml;
    });
  });
});
