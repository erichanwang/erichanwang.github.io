import subprocess
import os

def get_file_size_mb(file_path):
    """Get file size in MiB."""
    if os.path.exists(file_path):
        size_bytes = os.path.getsize(file_path)
        size_mb = size_bytes / (1024 * 1024)
        return size_mb
    return 0

def compress_video(input_file, output_file, bitrate='1000k', max_size_mb=25):
    """
    Compresses an MP4 video file using ffmpeg, adjusting bitrate if needed to stay under max size.

    Args:
        input_file (str): Path to the input MP4 file.
        output_file (str): Path to the output compressed MP4 file.
        bitrate (str): Initial video bitrate for compression (default: '1000k').
        max_size_mb (float): Maximum allowed size in MiB (default: 25).
    """
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        return False

    original_size = get_file_size_mb(input_file)
    print(f"Original file size: {original_size:.2f} MiB")

    current_bitrate = bitrate
    attempts = 0
    max_attempts = 5  # Prevent infinite loop

    while attempts < max_attempts:
        command = [
            'ffmpeg',
            '-i', input_file,
            '-b:v', current_bitrate,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-strict', '-2',
            '-y',  # Overwrite output file without asking
            output_file
        ]

        try:
            subprocess.run(command, check=True)
            compressed_size = get_file_size_mb(output_file)
            print(f"Compressed file size (bitrate {current_bitrate}): {compressed_size:.2f} MiB")

            if compressed_size <= max_size_mb:
                compression_ratio = ((original_size - compressed_size) / original_size) * 100
                print(f"Compression successful! Reduction: {compression_ratio:.2f}% (from {original_size:.2f} MiB to {compressed_size:.2f} MiB)")
                return True
            else:
                print(f"Compressed size {compressed_size:.2f} MiB exceeds max {max_size_mb} MiB. Retrying with lower bitrate...")
                # Halve the bitrate for next attempt
                if 'k' in current_bitrate:
                    num = float(current_bitrate[:-1])
                    current_bitrate = f"{num / 2:.0f}k"
                attempts += 1

        except subprocess.CalledProcessError as e:
            print(f"Error during compression: {e}")
            return False
        except FileNotFoundError:
            print("Error: ffmpeg is not installed or not in PATH.")
            return False

    print(f"Failed to compress under {max_size_mb} MiB after {max_attempts} attempts.")
    return False

if __name__ == "__main__":
    # Example usage
    input_video = "images/project images/rubiks_cube_simulation_video1.mp4"
    output_video = "images/compressed_rubiks_video.mp4"
    compress_video(input_video, output_video)
