import subprocess
import os

def compress_video(input_file, output_file, bitrate='1000k'):
    """
    Compresses an MP4 video file using ffmpeg.

    Args:
        input_file (str): Path to the input MP4 file.
        output_file (str): Path to the output compressed MP4 file.
        bitrate (str): Video bitrate for compression (default: '1000k').
    """
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        return

    command = [
        'ffmpeg',
        '-i', input_file,
        '-b:v', bitrate,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-strict', '-2',
        '-y',  # Overwrite output file without asking
        output_file
    ]

    try:
        subprocess.run(command, check=True)
        print(f"Video compressed successfully: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error during compression: {e}")
    except FileNotFoundError:
        print("Error: ffmpeg is not installed or not in PATH.")

if __name__ == "__main__":
    # Example usage
    input_video = "python/rubiks_cube_simulation_video1 (1).mp4"
    output_video = "compressed_video.mp4"
    compress_video(input_video, output_video)
