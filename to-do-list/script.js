$(document).ready(function() {

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type) {
        var notification = $('<div class="notification ' + type + '">' + message + '</div>');
        $('body').append(notification);
        notification.addClass('show');
        setTimeout(function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Fungsi untuk membuka modal
    function openModal(title, date, description) {
        $('#modal-task-title').text(title);
        $('#modal-task-date').text(date);
        $('#modal-task-description').text(description);
        $('#task-modal').fadeIn();
    }

    // Fungsi untuk menutup modal
    function closeModal() {
        $('#task-modal').fadeOut();
    }

    // Event click untuk tombol "View Details"
    $('.view-task-btn').click(function() {
        var title = $(this).siblings('h3').text();
        var date = $(this).siblings('.task-date').text();
        var description = $(this).siblings('.task-description').text();

        openModal(title, date, description);
    });

    // Event click untuk tombol close pada modal
    $('.close').click(function() {
        closeModal();
    });

    // Jika area di luar modal diklik, modal akan ditutup
    $(window).click(function(event) {
        if (event.target === document.getElementById('task-modal')) {
            closeModal();
        }
    });

    // Initialize FullCalendar
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        navLinks: true,
        editable: true,
        eventLimit: true,
        events: '/api/events',
        selectable: true,
        selectHelper: true,
        select: function(start, end) {
            var title = prompt('Event Title:');
            var eventData;
            if (title) {
                eventData = {
                    title: title,
                    start: start,
                    end: end
                };
                $.ajax({
                    url: '/api/events',
                    type: 'POST',
                    data: JSON.stringify(eventData),
                    contentType: 'application/json',
                    success: function() {
                        $('#calendar').fullCalendar('renderEvent', eventData, true);
                        showNotification('Event added successfully!', 'success');
                    },
                    error: function(xhr, status, error) {
                        console.error("Error adding event:", error);
                        showNotification('Failed to add event. Please try again.', 'error');
                    }
                });
            }
            $('#calendar').fullCalendar('unselect');
        },
        eventClick: function(event) {
            if (confirm("Are you sure you want to delete this event?")) {
                $.ajax({
                    url: '/api/events/' + event.id,
                    type: 'DELETE',
                    success: function() {
                        $('#calendar').fullCalendar('removeEvents', event.id);
                        showNotification('Event deleted successfully!', 'success');
                    },
                    error: function(xhr, status, error) {
                        console.error("Error deleting event:", error);
                        showNotification('Failed to delete event. Please try again.', 'error');
                    }
                });
            }
        },
        eventRender: function(event, element) {
            element.addClass('fade-in');
        }
    });

    // Task list functionality
    $('#add-task-form').submit(function(e) {
        e.preventDefault();
        var taskName = $('#task-name').val();
        if (taskName) {
            var taskItem = $('<li class="slide-in-left">' + taskName + '<button class="delete-task">Delete</button></li>');
            $('#task-list').append(taskItem);
            $('#task-name').val('');
            showNotification('Task added successfully!', 'success');
        }
    });

    // Event click untuk tombol delete pada task
    $('#task-list').on('click', '.delete-task', function() {
        $(this).parent().fadeOut(300, function() {
            $(this).remove();
            showNotification('Task deleted successfully!', 'success');
        });
    });

    // Dark mode toggle
    $('#dark-mode-toggle').change(function() {
        $('body').toggleClass('dark-mode');
        if ($('body').hasClass('dark-mode')) {
            showNotification('Dark mode enabled', 'success');
        } else {
            showNotification('Light mode enabled', 'success');
        }
    });

    // Smooth scrolling for navigation links
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });

    // Add hover effect to buttons
    $('.btn').hover(
        function() { $(this).addClass('btn-hover'); },
        function() { $(this).removeClass('btn-hover'); }
    );

    // Initialize AOS (Animate on Scroll) library
    AOS.init();
});
