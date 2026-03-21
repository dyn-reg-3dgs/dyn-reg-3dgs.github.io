window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function setupSynchronizedVideoGroups() {
    const videoGroups = document.querySelectorAll('.sync-video-group');

    if (videoGroups.length === 0) return;

    const syncGroupToLeader = (videos, leader) => {
        videos.forEach(video => {
            if (video === leader) return;

            if (Math.abs(video.currentTime - leader.currentTime) > 0.12) {
                try {
                    video.currentTime = leader.currentTime;
                } catch (e) {
                    // Ignore sync errors while metadata is still loading.
                }
            }

            if (video.playbackRate !== leader.playbackRate) {
                video.playbackRate = leader.playbackRate;
            }
        });
    };

    videoGroups.forEach(group => {
        const videos = Array.from(group.querySelectorAll('.video-row-item video'));

        if (videos.length === 0) return;

        const leader = videos[0];
        let isVisible = false;

        const syncFollowers = () => syncGroupToLeader(videos, leader);

        const playGroup = () => {
            syncFollowers();

            const playPromises = videos.map(video => video.play().catch(() => null));
            Promise.all(playPromises).catch(() => null);
        };

        const pauseGroup = () => {
            videos.forEach(video => video.pause());
        };

        leader.addEventListener('play', () => {
            if (!isVisible) return;

            syncFollowers();
            videos.forEach(video => {
                if (video !== leader && video.paused) {
                    video.play().catch(() => null);
                }
            });
        });

        leader.addEventListener('pause', () => {
            videos.forEach(video => {
                if (video !== leader) {
                    video.pause();
                }
            });
        });

        ['seeking', 'seeked', 'ratechange', 'loadedmetadata'].forEach(eventName => {
            leader.addEventListener(eventName, syncFollowers);
        });

        leader.addEventListener('timeupdate', syncFollowers);

        videos.forEach(video => {
            video.muted = true;
            video.playsInline = true;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target !== group) return;

                isVisible = entry.isIntersecting;

                if (isVisible) {
                    playGroup();
                } else {
                    pauseGroup();
                }
            });
        }, {
            threshold: 0.35
        });

        observer.observe(group);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Setup synchronized autoplay for visible video demo groups
    setupSynchronizedVideoGroups();

})
