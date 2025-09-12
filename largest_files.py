import os


def get_largest_files(
    root_dir=".", n=5, extensions=(".js", ".ts", ".tsx", ".jsx", ".py")
):
    file_sizes = []

    for folder, _, files in os.walk(root_dir):
        for f in files:
            if f.endswith(extensions):
                file_path = os.path.join(folder, f)
                try:
                    size = os.path.getsize(file_path)
                    file_sizes.append((file_path, size))
                except OSError:
                    # If some file is cursed and unreadable, just skip
                    continue

    # Sort by size, descending
    file_sizes.sort(key=lambda x: x[1], reverse=True)

    # Return top N
    return file_sizes[:n]


if __name__ == "__main__":
    n = 5  # how many fatties to report
    largest_files = get_largest_files(".", n)
    print(f"Top {n} largest files:")
    for path, size in largest_files:
        print(f"{size/1024:.2f} KB\t{path}")
